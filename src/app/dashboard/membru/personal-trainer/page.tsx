"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  startOfDay,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconUser,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconHeart,
  IconMessageCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

// User subscription interface
interface UserSubscription {
  type: string;
  hasExtraSessions: number;
  remainingSessions: number;
}

// Trainers interface
interface Trainer {
  id: string;
  name: string;
  avatar: string;
  specialization: string;
  experience: string;
  rating: number;
  email: string;
  phone: string;
  description: string;
}

// Trainer availability interface
interface TrainerAvailability {
  date: Date;
  times: string[];
}

// Session history interface
interface SessionHistory {
  id: string;
  trainerId: string;
  trainerName: string;
  date: Date;
  time: string;
  duration: number;
  status: string;
  feedbackGiven: boolean;
}

export default function Page() {
  const { data: session } = useSession();
  const [selectedTrainer, setSelectedTrainer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [carePlanDialogOpen, setCarePlanDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionHistory | null>(
    null
  );
  const [carePlanTrainer, setCarePlanTrainer] = useState<string>("");
  const [carePlanMessage, setCarePlanMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // State for API data
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainerAvailability, setTrainerAvailability] = useState<
    TrainerAvailability[]
  >([]);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [userSubscription, setUserSubscription] =
    useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Calculate weekEnd based on weekStart
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Fetch trainers on component mount
  useEffect(() => {
    if (session?.user) {
      fetchTrainers();
      fetchSessionHistory();
      fetchUserSubscription();
    }
  }, [session]);

  // Fetch trainer availability when trainer is selected
  useEffect(() => {
    if (selectedTrainer && session?.user) {
      fetchTrainerAvailability(selectedTrainer, weekStart, weekEnd);
    }
  }, [selectedTrainer, session?.user, weekStart, weekEnd]);

  const fetchTrainers = async () => {
    try {
      const response = await fetch("/api/membru/personal-trainer/antrenori");
      if (response.ok) {
        const data = await response.json();
        setTrainers(data);
      }
    } catch (error) {
      console.error("Eroare la încărcarea antrenorilor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainerAvailability = async (
    trainerId: string,
    start: Date,
    end: Date
  ) => {
    try {
      const url = `/api/membru/personal-trainer/program?antrenorId=${trainerId}&startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      console.log("Fetching trainer availability:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Received data:", data);
        setTrainerAvailability(
          data.map((item: TrainerAvailability) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        console.error("API Error:", response.status, errorData);
        toast.error(`Eroare la încărcarea programului: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Eroare de rețea la încărcarea programului antrenorului");
    }
  };

  const fetchSessionHistory = async () => {
    try {
      const response = await fetch("/api/membru/personal-trainer/istoric");
      if (response.ok) {
        const data = await response.json();
        setSessionHistory(
          data.map((item: SessionHistory) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      }
    } catch (error) {
      console.error("Eroare la încărcarea istoricului:", error);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const response = await fetch("/api/membru/abonament");
      if (response.ok) {
        const data = await response.json();
        // Map the API response to the UserSubscription interface
        if (data.abonamentCurent) {
          setUserSubscription({
            type: data.abonamentCurent.tipAbonament,
            hasExtraSessions: data.sedintePT?.disponibile || 0,
            remainingSessions: data.sedintePT?.disponibile || 0,
          });
        } else {
          // No active subscription
          setUserSubscription({
            type: "None",
            hasExtraSessions: 0,
            remainingSessions: 0,
          });
        }
      }
    } catch (error) {
      console.error("Eroare la încărcarea abonamentului:", error);
      // Fallback to no subscription
      setUserSubscription({
        type: "None",
        hasExtraSessions: 0,
        remainingSessions: 0,
      });
    }
  };

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation for week view
  const previousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    if (selectedTrainer) {
      fetchTrainerAvailability(
        selectedTrainer,
        newWeekStart,
        endOfWeek(newWeekStart, { weekStartsOn: 1 })
      );
    }
  };

  const nextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    if (selectedTrainer) {
      fetchTrainerAvailability(
        selectedTrainer,
        newWeekStart,
        endOfWeek(newWeekStart, { weekStartsOn: 1 })
      );
    }
  };

  // Get trainer by ID
  const getTrainer = (id: string) => {
    return trainers.find((trainer) => trainer.id === id);
  };

  // Get availability for selected trainer and date
  const getAvailableSlots = (trainerId: string, date: Date) => {
    const dayAvailability = trainerAvailability.find((slot) =>
      isSameDay(slot.date, date)
    );
    return dayAvailability?.times || [];
  };

  // Check if user can book sessions
  const canBookSessions = () => {
    if (!userSubscription) return false;

    return (
      userSubscription.type === "Premium" ||
      userSubscription.hasExtraSessions > 0
    );
  };

  // Check if user can request care plans
  const canRequestCarePlans = () => {
    if (!userSubscription) return false;

    return (
      userSubscription.type === "Standard+" ||
      userSubscription.type === "Premium"
    );
  };

  // Handle booking confirmation
  const confirmBooking = async () => {
    if (selectedTrainer && selectedDate && selectedTime) {
      setBookingLoading(true);
      try {
        const response = await fetch("/api/membru/personal-trainer/rezervare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            antrenorId: selectedTrainer,
            dataSesiune: selectedDate.toISOString(),
            oraSesiune: selectedTime,
          }),
        });

        if (response.ok) {
          toast.success("Ședința a fost rezervată cu succes!");

          // Refresh data
          fetchSessionHistory();
          fetchUserSubscription(); // Refresh subscription data to update PT session count
          if (selectedTrainer) {
            fetchTrainerAvailability(selectedTrainer, weekStart, weekEnd);
          }

          setBookingDialogOpen(false);
          setSelectedTrainer(null);
          setSelectedDate(null);
          setSelectedTime(null);
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Eroare la rezervarea ședinței");
        }
      } catch (error) {
        console.error("Eroare la rezervarea ședinței:", error);
        toast.error("Eroare la rezervarea ședinței");
      } finally {
        setBookingLoading(false);
      }
    }
  };

  // Handle care plan request
  const submitCarePlanRequest = async () => {
    if (carePlanTrainer && carePlanMessage) {
      try {
        const response = await fetch("/api/plan-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            antrenorId: carePlanTrainer,
            tipPlan: "ambele", // Default to both nutrition and exercise plans
            mesaj: carePlanMessage,
          }),
        });

        if (response.ok) {
          toast.success("Cererea de plan a fost trimisă cu succes!");
          setCarePlanDialogOpen(false);
          setCarePlanTrainer("");
          setCarePlanMessage("");
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Eroare la trimiterea cererii");
        }
      } catch (error) {
        console.error("Eroare la trimiterea cererii de plan:", error);
        toast.error("Eroare la trimiterea cererii de plan");
      }
    }
  };

  // Handle session cancellation
  const cancelSession = async (sessionId: string) => {
    if (confirm("Sigur doriți să anulați această ședință?")) {
      try {
        const response = await fetch("/api/sesiuni-private", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: sessionId,
            updates: { status: "anulata" },
          }),
        });

        if (response.ok) {
          toast.success("Ședința a fost anulată cu succes!");
          fetchSessionHistory();
          // Refresh trainer availability if a trainer is selected
          if (selectedTrainer) {
            fetchTrainerAvailability(selectedTrainer, weekStart, weekEnd);
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Eroare la anularea ședinței");
        }
      } catch (error) {
        console.error("Eroare la anularea ședinței:", error);
        toast.error("Eroare la anularea ședinței");
      }
    }
  };

  // Handle feedback submission
  const submitFeedback = async () => {
    if (selectedSession && feedbackMessage) {
      try {
        const response = await fetch("/api/membru/personal-trainer/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: selectedSession.id,
            feedbackMessage: feedbackMessage,
          }),
        });

        if (response.ok) {
          toast.success("Feedback-ul a fost trimis cu succes!");
          setFeedbackDialogOpen(false);
          setSelectedSession(null);
          setFeedbackMessage("");
          // Refresh session history to update feedback status
          fetchSessionHistory();
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.message || "Eroare la trimiterea feedback-ului"
          );
        }
      } catch (error) {
        console.error("Eroare la trimiterea feedback-ului:", error);
        toast.error("Eroare la trimiterea feedback-ului");
      }
    }
  };

  // Show loading while session is loading
  if (!session) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p>Se încarcă...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Personal Trainer</h1>
            <p className="text-muted-foreground mt-1">
              Rezervă sesiuni cu antrenorii noștri și urmărește-ți progresul
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {userSubscription && (
              <>
                <Badge variant="outline">{userSubscription.type}</Badge>
                {userSubscription.hasExtraSessions > 0 && (
                  <Badge variant="secondary">
                    {userSubscription.remainingSessions} ședințe rămase
                  </Badge>
                )}
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="book" className="w-full">
          <TabsList>
            <TabsTrigger value="book">Rezervă ședință</TabsTrigger>
            <TabsTrigger value="care-plan">
              Plan alimentar/exerciții
            </TabsTrigger>
            <TabsTrigger value="history">Istoric ședințe</TabsTrigger>
          </TabsList>

          {/* Book Session Tab */}
          <TabsContent value="book" className="space-y-6 mt-6">
            {!canBookSessions() ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Acces restricționat
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Pentru a rezerva ședințe cu antrenorii personali, ai nevoie
                    de un abonament Premium sau să achiziționezi ședințe extra.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/membru/abonamentul-meu">
                      Upgrade la Premium
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Trainer Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <IconUser className="h-5 w-5" /> Selectează antrenorul
                    </CardTitle>
                    <CardDescription>
                      Alege antrenorul cu care vrei să lucrezi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center p-8">
                        <p>Se încarcă antrenorii...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trainers.map((trainer) => (
                          <Card
                            key={trainer.id}
                            className={`cursor-pointer transition-all ${
                              selectedTrainer === trainer.id
                                ? "ring-2 ring-primary"
                                : ""
                            }`}
                            onClick={() => setSelectedTrainer(trainer.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-12 w-12">
                                  <AvatarImage
                                    src={trainer.avatar}
                                    alt={trainer.name}
                                  />
                                  <AvatarFallback>
                                    {trainer.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold">
                                    {trainer.name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {trainer.specialization}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Calendar */}
                {selectedTrainer && (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          <IconCalendar className="h-5 w-5" /> Program
                          disponibil
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={previousWeek}
                          >
                            <IconChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium">
                            {format(weekStart, "d MMM", { locale: ro })} -{" "}
                            {format(weekEnd, "d MMM yyyy", { locale: ro })}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={nextWeek}
                          >
                            <IconChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Selectează o dată și oră pentru ședința ta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day) => {
                          const availableSlots = getAvailableSlots(
                            selectedTrainer,
                            day
                          );
                          const isToday = isSameDay(day, new Date());
                          const isPast = isBefore(day, startOfDay(new Date()));

                          return (
                            <div key={day.toString()} className="space-y-2">
                              <div className="text-center p-2">
                                <div className="text-xs text-muted-foreground">
                                  {format(day, "EEE", { locale: ro })}
                                </div>
                                <div
                                  className={`text-sm font-medium ${
                                    isToday ? "text-primary" : ""
                                  } ${isPast ? "text-muted-foreground" : ""}`}
                                >
                                  {format(day, "d")}
                                </div>
                              </div>
                              <div className="space-y-1">
                                {availableSlots.map((time: string) => {
                                  const isTimePast =
                                    isToday &&
                                    (() => {
                                      const [hours, minutes] = time
                                        .split(":")
                                        .map(Number);
                                      const slotTime = new Date();
                                      slotTime.setHours(hours, minutes, 0, 0);
                                      return isBefore(slotTime, new Date());
                                    })();

                                  return (
                                    <Button
                                      key={time}
                                      variant={
                                        selectedDate &&
                                        isSameDay(selectedDate, day) &&
                                        selectedTime === time
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      className="w-full text-xs"
                                      disabled={isPast || isTimePast}
                                      onClick={() => {
                                        setSelectedDate(day);
                                        setSelectedTime(time);
                                        setBookingDialogOpen(true);
                                      }}
                                    >
                                      {time}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Care Plan Tab */}
          <TabsContent value="care-plan" className="space-y-6 mt-6">
            {!canRequestCarePlans() ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Acces restricționat
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Pentru a solicita planuri alimentare sau de exerciții, ai
                    nevoie de un abonament Premium.
                  </p>
                  <Button asChild>
                    <Link href="/dashboard/membru/abonamentul-meu">
                      Upgrade la Premium
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconHeart className="h-5 w-5" /> Solicită plan personalizat
                  </CardTitle>
                  <CardDescription>
                    Cere antrenorului tău un plan alimentar sau de exerciții
                    personalizat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => setCarePlanDialogOpen(true)}
                    className="w-full"
                  >
                    Solicită plan alimentar/exerciții
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Session History Tab */}
          <TabsContent value="history" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconClock className="h-5 w-5" /> Istoric ședințe
                </CardTitle>
                <CardDescription>
                  Vizualizează ședințele tale finalizate cu antrenorii personali
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center p-8">
                    <p>Se încarcă istoricul...</p>
                  </div>
                ) : sessionHistory.length > 0 ? (
                  <div className="space-y-4">
                    {sessionHistory.map((session) => {
                      const trainer = getTrainer(session.trainerId);
                      return (
                        <Card key={session.id}>
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={trainer?.avatar}
                                    alt={trainer?.name || session.trainerName}
                                  />
                                  <AvatarFallback>
                                    {(
                                      trainer?.name || session.trainerName
                                    ).substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">
                                    {trainer?.name || session.trainerName}
                                  </h4>
                                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <span>
                                      {format(session.date, "d MMMM yyyy", {
                                        locale: ro,
                                      })}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      {session.time} -{" "}
                                      {session.time.split(":")[0] === "23"
                                        ? "00"
                                        : String(
                                            parseInt(
                                              session.time.split(":")[0]
                                            ) + 1
                                          ).padStart(2, "0")}
                                      :{session.time.split(":")[1]}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{session.duration} min</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                                <Badge
                                  variant={
                                    session.status === "finalizata"
                                      ? "default"
                                      : session.status === "confirmata"
                                        ? "secondary"
                                        : "outline"
                                  }
                                >
                                  <IconCheck className="h-3 w-3 mr-1" />
                                  {session.status === "finalizata"
                                    ? "Finalizată"
                                    : session.status === "confirmata"
                                      ? "Confirmată"
                                      : "Anulată"}
                                </Badge>
                                {(session.status === "finalizata" ||
                                  session.status === "confirmata") &&
                                  !session.feedbackGiven && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSession(session);
                                        setFeedbackDialogOpen(true);
                                      }}
                                    >
                                      <IconMessageCircle className="h-4 w-4 mr-1" />
                                      Oferă feedback
                                    </Button>
                                  )}
                                {session.status === "confirmata" && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => cancelSession(session.id)}
                                  >
                                    <IconX className="h-4 w-4 mr-1" />
                                    Anulează
                                  </Button>
                                )}
                                {session.feedbackGiven && (
                                  <Badge variant="secondary">
                                    Feedback trimis
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <p className="text-muted-foreground">
                      Nu ai încă ședințe cu antrenorii personali
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Booking Confirmation Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmă rezervarea</DialogTitle>
            <DialogDescription>
              Ești pe cale să rezervi o ședință cu antrenorul personal.
            </DialogDescription>
          </DialogHeader>

          {selectedTrainer && selectedDate && selectedTime && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={getTrainer(selectedTrainer)?.avatar}
                      alt={getTrainer(selectedTrainer)?.name}
                    />
                    <AvatarFallback>
                      {getTrainer(selectedTrainer)?.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {getTrainer(selectedTrainer)?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getTrainer(selectedTrainer)?.specialization}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <IconCalendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(selectedDate, "d MMMM yyyy", { locale: ro })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedTime} -{" "}
                      {selectedTime.split(":")[0] === "23"
                        ? "00"
                        : String(
                            parseInt(selectedTime.split(":")[0]) + 1
                          ).padStart(2, "0")}
                      :{selectedTime.split(":")[1]} (60 min)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBookingDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button onClick={confirmBooking} disabled={bookingLoading}>
              {bookingLoading ? "Se rezervă..." : "Confirmă rezervarea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Care Plan Request Dialog */}
      <Dialog open={carePlanDialogOpen} onOpenChange={setCarePlanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicită plan personalizat</DialogTitle>
            <DialogDescription>
              Alege antrenorul și descrie ce tip de plan ai nevoie.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trainer">Antrenor</Label>
              <Select
                value={carePlanTrainer}
                onValueChange={setCarePlanTrainer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează antrenorul" />
                </SelectTrigger>
                <SelectContent>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id.toString()}>
                      {trainer.name} - {trainer.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Mesaj</Label>
              <Textarea
                id="message"
                placeholder="Descrie ce tip de plan ai nevoie (alimentar, exerciții, obiective specifice, etc.)"
                value={carePlanMessage}
                onChange={(e) => setCarePlanMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCarePlanDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              onClick={submitCarePlanRequest}
              disabled={!carePlanTrainer || !carePlanMessage}
            >
              Trimite solicitarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Oferă feedback antrenorului</DialogTitle>
            <DialogDescription>
              Feedbackul tău va ajuta antrenorul să își îmbunătățească
              serviciile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSession && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={getTrainer(selectedSession.trainerId)?.avatar}
                    alt={
                      getTrainer(selectedSession.trainerId)?.name ||
                      selectedSession.trainerName
                    }
                  />
                  <AvatarFallback>
                    {(
                      getTrainer(selectedSession.trainerId)?.name ||
                      selectedSession.trainerName
                    ).substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {getTrainer(selectedSession.trainerId)?.name ||
                      selectedSession.trainerName}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(selectedSession.date, "d MMMM yyyy", {
                      locale: ro,
                    })}
                    , {selectedSession.time}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea
                id="feedback"
                placeholder="Împărtășește-ne experiența ta cu acest antrenor..."
                value={feedbackMessage}
                onChange={(e) => setFeedbackMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFeedbackDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button onClick={submitFeedback} disabled={!feedbackMessage}>
              Trimite feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
