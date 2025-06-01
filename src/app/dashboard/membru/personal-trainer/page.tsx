"use client";

import { useState } from "react";
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
  IconStar,
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

// Mock data for user subscription
const userSubscription = {
  type: "Premium", // Standard, Standard+, Premium
  hasExtraSessions: 3, // Number of extra purchased sessions
  remainingSessions: 2,
};

// Mock data for trainers
const trainers = [
  {
    id: 1,
    name: "Maria Ionescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Fitness General, Crossfit",
    experience: "5 ani",
    rating: 4.8,
    email: "maria.ionescu@fitlife.ro",
    phone: "+40721123456",
    description:
      "Antrenor certificat cu experiență în fitness general și crossfit. Specializat în antrenamente personalizate pentru toate nivelurile.",
  },
  {
    id: 2,
    name: "Andrei Popescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Bodybuilding, Powerlifting",
    experience: "8 ani",
    rating: 4.9,
    email: "andrei.popescu@fitlife.ro",
    phone: "+40721123457",
    description:
      "Expert în bodybuilding și powerlifting. Ajută clienții să-și atingă obiectivele de forță și masă musculară.",
  },
  {
    id: 3,
    name: "Elena Dumitrescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Yoga, Pilates, Wellness",
    experience: "6 ani",
    rating: 4.7,
    email: "elena.dumitrescu@fitlife.ro",
    phone: "+40721123458",
    description:
      "Instructor certificat de yoga și pilates. Se concentrează pe wellness-ul general și echilibrul corp-minte.",
  },
  {
    id: 4,
    name: "Alexandru Stanescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Functional Training, TRX",
    experience: "4 ani",
    rating: 4.6,
    email: "alexandru.stanescu@fitlife.ro",
    phone: "+40721123459",
    description:
      "Specialist în antrenament funcțional și TRX. Ideal pentru îmbunătățirea performanței atletice.",
  },
];

// Mock data for trainer availability (next 4 weeks)
type TrainerAvailability = {
  [key: number]: { date: Date; times: string[] }[];
};
const trainerAvailability: TrainerAvailability = {
  1: [
    { date: new Date(2025, 5, 2), times: ["09:00", "10:00", "15:00", "16:00"] },
    { date: new Date(2025, 5, 3), times: ["08:00", "09:00", "17:00", "18:00"] },
    { date: new Date(2025, 5, 4), times: ["10:00", "11:00", "14:00", "15:00"] },
    { date: new Date(2025, 5, 5), times: ["09:00", "16:00", "17:00"] },
    { date: new Date(2025, 5, 9), times: ["08:00", "09:00", "15:00", "16:00"] },
    {
      date: new Date(2025, 5, 10),
      times: ["10:00", "11:00", "17:00", "18:00"],
    },
    { date: new Date(2025, 5, 11), times: ["09:00", "14:00", "15:00"] },
    { date: new Date(2025, 5, 12), times: ["08:00", "16:00", "17:00"] },
  ],
  2: [
    { date: new Date(2025, 5, 2), times: ["11:00", "12:00", "17:00", "18:00"] },
    { date: new Date(2025, 5, 3), times: ["10:00", "11:00", "15:00", "16:00"] },
    { date: new Date(2025, 5, 4), times: ["08:00", "09:00", "16:00", "17:00"] },
    { date: new Date(2025, 5, 6), times: ["09:00", "10:00", "14:00", "15:00"] },
    { date: new Date(2025, 5, 9), times: ["11:00", "12:00", "16:00", "17:00"] },
    {
      date: new Date(2025, 5, 10),
      times: ["08:00", "09:00", "18:00", "19:00"],
    },
    {
      date: new Date(2025, 5, 13),
      times: ["10:00", "11:00", "15:00", "16:00"],
    },
  ],
  3: [
    { date: new Date(2025, 5, 2), times: ["07:00", "08:00", "18:00", "19:00"] },
    { date: new Date(2025, 5, 4), times: ["07:00", "08:00", "15:00", "16:00"] },
    { date: new Date(2025, 5, 5), times: ["10:00", "11:00", "17:00", "18:00"] },
    { date: new Date(2025, 5, 6), times: ["07:00", "08:00", "16:00", "17:00"] },
    { date: new Date(2025, 5, 9), times: ["07:00", "08:00", "18:00", "19:00"] },
    {
      date: new Date(2025, 5, 11),
      times: ["10:00", "11:00", "15:00", "16:00"],
    },
    {
      date: new Date(2025, 5, 12),
      times: ["07:00", "08:00", "17:00", "18:00"],
    },
  ],
  4: [
    { date: new Date(2025, 5, 3), times: ["12:00", "13:00", "19:00", "20:00"] },
    { date: new Date(2025, 5, 4), times: ["12:00", "13:00", "18:00", "19:00"] },
    { date: new Date(2025, 5, 5), times: ["11:00", "12:00", "18:00", "19:00"] },
    { date: new Date(2025, 5, 6), times: ["12:00", "13:00", "17:00", "18:00"] },
    {
      date: new Date(2025, 5, 10),
      times: ["12:00", "13:00", "19:00", "20:00"],
    },
    {
      date: new Date(2025, 5, 11),
      times: ["11:00", "12:00", "18:00", "19:00"],
    },
    {
      date: new Date(2025, 5, 12),
      times: ["12:00", "13:00", "17:00", "18:00"],
    },
  ],
};

// Mock data for session history
const sessionHistory = [
  {
    id: 1,
    trainerId: 1,
    date: new Date(2025, 4, 20, 10, 0),
    duration: 60,
    status: "completed",
    feedbackGiven: false,
  },
  {
    id: 2,
    trainerId: 2,
    date: new Date(2025, 4, 22, 15, 0),
    duration: 60,
    status: "completed",
    feedbackGiven: true,
  },
  {
    id: 3,
    trainerId: 1,
    date: new Date(2025, 4, 25, 9, 0),
    duration: 60,
    status: "completed",
    feedbackGiven: false,
  },
  {
    id: 4,
    trainerId: 3,
    date: new Date(2025, 4, 28, 18, 0),
    duration: 60,
    status: "completed",
    feedbackGiven: true,
  },
];

export default function Page() {
  const [selectedTrainer, setSelectedTrainer] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [carePlanDialogOpen, setCarePlanDialogOpen] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  interface Session {
    id: number;
    trainerId: number;
    date: Date;
    duration: number;
    status: string;
    feedbackGiven: boolean;
  }
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [carePlanTrainer, setCarePlanTrainer] = useState<string>("");
  const [carePlanMessage, setCarePlanMessage] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Calculate weekEnd based on weekStart
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation for week view
  const previousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const nextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  // Get trainer by ID
  const getTrainer = (id: number) => {
    return trainers.find((trainer) => trainer.id === id);
  };

  // Get availability for selected trainer and date
  const getAvailableSlots = (trainerId: number, date: Date) => {
    const availability = trainerAvailability[trainerId] || [];
    const dayAvailability = availability.find(
      (slot: { date: Date; times: string[] }) => isSameDay(slot.date, date)
    );
    return dayAvailability?.times || [];
  };

  // Check if user can book sessions
  const canBookSessions = () => {
    return (
      userSubscription.type === "Premium" ||
      userSubscription.hasExtraSessions > 0
    );
  };

  // Check if user can request care plans
  const canRequestCarePlans = () => {
    return (
      userSubscription.type === "Standard+" ||
      userSubscription.type === "Premium"
    );
  };

  // Handle booking confirmation
  const confirmBooking = () => {
    if (selectedTrainer && selectedDate && selectedTime) {
      // In a real app, you would call an API to book the session
      console.log("Booking confirmed:", {
        trainerId: selectedTrainer,
        date: selectedDate,
        time: selectedTime,
      });
      setBookingDialogOpen(false);
      setSelectedTrainer(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  };

  // Handle care plan request
  const submitCarePlanRequest = () => {
    if (carePlanTrainer && carePlanMessage) {
      // In a real app, you would call an API to send the request
      console.log("Care plan requested:", {
        trainerId: carePlanTrainer,
        message: carePlanMessage,
      });
      setCarePlanDialogOpen(false);
      setCarePlanTrainer("");
      setCarePlanMessage("");
    }
  };

  // Handle feedback submission
  const submitFeedback = () => {
    if (selectedSession && feedbackMessage) {
      // In a real app, you would call an API to send feedback
      console.log("Feedback submitted:", {
        sessionId: selectedSession.id,
        message: feedbackMessage,
      });
      setFeedbackDialogOpen(false);
      setSelectedSession(null);
      setFeedbackMessage("");
    }
  };

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
            <Badge variant="outline">{userSubscription.type}</Badge>
            {userSubscription.hasExtraSessions > 0 && (
              <Badge variant="secondary">
                {userSubscription.remainingSessions} ședințe rămase
              </Badge>
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
                  <Button>Upgrade la Premium</Button>
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
                                <div className="flex items-center mt-1">
                                  <IconStar className="h-4 w-4 text-yellow-500 mr-1" />
                                  <span className="text-sm">
                                    {trainer.rating}
                                  </span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    • {trainer.experience}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-3">
                              {trainer.description}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
                                {availableSlots.map((time: string) => (
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
                                    disabled={isPast}
                                    onClick={() => {
                                      setSelectedDate(day);
                                      setSelectedTime(time);
                                      setBookingDialogOpen(true);
                                    }}
                                  >
                                    {time}
                                  </Button>
                                ))}
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
                    nevoie de un abonament Standard+ sau Premium.
                  </p>
                  <Button>Upgrade abonamentul</Button>
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
                {sessionHistory.length > 0 ? (
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
                                    alt={trainer?.name}
                                  />
                                  <AvatarFallback>
                                    {trainer?.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-semibold">
                                    {trainer?.name}
                                  </h4>
                                  <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                    <span>
                                      {format(session.date, "d MMMM yyyy", {
                                        locale: ro,
                                      })}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>
                                      {format(session.date, "HH:mm")} -{" "}
                                      {format(
                                        addDays(session.date, 0),
                                        "HH:mm"
                                      )}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{session.duration} min</span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 md:mt-0 flex items-center space-x-2">
                                <Badge
                                  variant={
                                    session.status === "completed"
                                      ? "default"
                                      : "secondary"
                                  }
                                >
                                  <IconCheck className="h-3 w-3 mr-1" />
                                  Finalizată
                                </Badge>
                                {!session.feedbackGiven && (
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
                      Nu ai încă ședințe finalizate cu antrenorii personali
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
            <Button onClick={confirmBooking}>Confirmă rezervarea</Button>
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
              Feedbackul tău este anonim și va ajuta antrenorul să își
              îmbunătățească serviciile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedSession && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={getTrainer(selectedSession.trainerId)?.avatar}
                    alt={getTrainer(selectedSession.trainerId)?.name}
                  />
                  <AvatarFallback>
                    {getTrainer(selectedSession.trainerId)?.name.substring(
                      0,
                      2
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {getTrainer(selectedSession.trainerId)?.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(selectedSession.date, "d MMMM yyyy, HH:mm", {
                      locale: ro,
                    })}
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
