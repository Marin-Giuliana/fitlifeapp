"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isBefore,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconBarbell,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// Interface definitions
interface ClassType {
  id: number;
  name: string;
  color: string;
}

interface Instructor {
  id: string;
  name: string;
  avatar: string;
}

interface GroupClass {
  id: string;
  typeId: number;
  date: string;
  time: string;
  instructor: Instructor;
  participants: number;
  maxParticipants: number;
  enrolled: boolean;
  status?: string;
}

interface UserClass {
  id: string;
  typeId: number;
  date: string;
  time: string;
  instructor: Instructor;
  status: string;
}

interface ClaseData {
  utilizator: {
    nume: string;
    email: string;
    areAbonamentValabil: boolean;
    tipAbonament: string | null;
  };
  tipuriClase: ClassType[];
  clase: GroupClass[];
  claseUtilizator: UserClass[];
  perioada: {
    startDate: string;
    endDate: string;
  };
}

export default function Page() {
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [claseData, setClaseData] = useState<ClaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const { data: session } = useSession();

  const fetchClaseData = useCallback(
    async (weekStartParam?: Date) => {
      try {
        setIsLoading(true);
        const searchDate = weekStartParam || weekStart;
        const weekStartISO = searchDate.toISOString();

        const response = await fetch(
          `/api/membru/clase?weekStart=${weekStartISO}`
        );
        if (response.ok) {
          const data = await response.json();
          setClaseData(data);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Eroare la încărcarea claselor");
        }
      } catch (error) {
        console.error("Eroare la încărcarea claselor:", error);
        toast.error("Eroare la încărcarea claselor");
      } finally {
        setIsLoading(false);
      }
    },
    [weekStart]
  );

  useEffect(() => {
    if (session) {
      fetchClaseData();
    }
  }, [session, weekStart, fetchClaseData]);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getClassType = (typeId: number) => {
    if (!claseData) return { name: "Unknown", color: "bg-gray-500" };
    return (
      claseData.tipuriClase.find((type) => type.id === typeId) || {
        name: "Unknown",
        color: "bg-gray-500",
      }
    );
  };

  const getClassesForDate = (date: Date) => {
    if (!claseData) return [];
    return claseData.clase
      .filter((cls) => isSameDay(new Date(cls.date), date))
      .sort(
        (a, b) =>
          new Date(a.date + " " + a.time).getTime() -
          new Date(b.date + " " + b.time).getTime()
      );
  };

  // Format time from string
  const formatTime = (time: string) => {
    return time;
  };

  // Navigation for week view
  const previousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
  };

  const nextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
  };

  const handleEnroll = (classItem: GroupClass) => {
    if (!claseData?.utilizator.areAbonamentValabil) {
      toast.error(
        "Ai nevoie de un abonament valabil pentru a te înscrie la clase"
      );
      return;
    }
    setSelectedClass(classItem);
    setDialogOpen(true);
  };

  const handleCancel = async (classId: string) => {
    try {
      setIsEnrolling(true);
      const response = await fetch("/api/membru/clase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clasaId: classId,
          actiune: "anulare",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchClaseData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la anularea înscrierii");
      }
    } catch (error) {
      console.error("Eroare la anularea înscrierii:", error);
      toast.error("Eroare la anularea înscrierii");
    } finally {
      setIsEnrolling(false);
    }
  };

  const confirmEnroll = async () => {
    if (!selectedClass) return;

    try {
      setIsEnrolling(true);
      const response = await fetch("/api/membru/clase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clasaId: selectedClass.id,
          actiune: "inscriere",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setDialogOpen(false);
        fetchClaseData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la înscriere");
      }
    } catch (error) {
      console.error("Eroare la înscriere:", error);
      toast.error("Eroare la înscriere");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!claseData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele claselor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Clase de grup</h1>
            <p className="text-muted-foreground mt-1">
              Descoperă și înscrie-te la clasele noastre de fitness de grup
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {claseData.tipuriClase.map((type) => (
              <div key={type.id} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                <span className="text-xs text-muted-foreground">
                  {type.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="list">Listă clase</TabsTrigger>
            <TabsTrigger value="my-classes">Clasele mele</TabsTrigger>
          </TabsList>

          {/* Week View */}
          <TabsContent value="list" className="space-y-6 mt-6">
            {claseData?.utilizator.tipAbonament === "Standard" ||
            claseData?.utilizator.tipAbonament === null ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Acces restricționat
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {claseData?.utilizator.tipAbonament === null
                      ? "Pentru a participa la clasele de grup, ai nevoie de un abonament Standard+ sau Premium."
                      : "Abonamentul Standard nu include accesul la clasele de grup. Ai nevoie de Standard+ sau Premium."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {claseData?.utilizator.tipAbonament === null ? (
                      <>
                        <Button asChild variant="outline">
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Cumpără Standard+
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Cumpără Premium
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline">
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Upgrade la Standard+
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Upgrade la Premium
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <IconCalendar className="h-5 w-5" /> Programul săptămânal
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
                      <Button variant="outline" size="icon" onClick={nextWeek}>
                        <IconChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Programul complet al claselor pentru săptămâna curentă
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zi</TableHead>
                          <TableHead>Oră</TableHead>
                          <TableHead>Clasă</TableHead>
                          <TableHead>Instructor</TableHead>
                          <TableHead>Locuri</TableHead>
                          <TableHead className="text-right">Acțiuni</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weekDays.map((day) => {
                          const dayClasses = getClassesForDate(day);
                          if (dayClasses.length === 0) {
                            return (
                              <TableRow key={day.toString()}>
                                <TableCell className="font-medium">
                                  {format(day, "EEEE", { locale: ro })}
                                  <div className="text-xs text-muted-foreground">
                                    {format(day, "d MMM", { locale: ro })}
                                  </div>
                                </TableCell>
                                <TableCell
                                  colSpan={5}
                                  className="text-center text-muted-foreground"
                                >
                                  Nu există clase programate
                                </TableCell>
                              </TableRow>
                            );
                          }

                          return dayClasses.map((cls, index) => {
                            const classType = getClassType(cls.typeId);
                            return (
                              <TableRow key={cls.id}>
                                {index === 0 && (
                                  <TableCell
                                    className="font-medium"
                                    rowSpan={dayClasses.length}
                                  >
                                    {format(day, "EEEE", { locale: ro })}
                                    <div className="text-xs text-muted-foreground">
                                      {format(day, "d MMM", { locale: ro })}
                                    </div>
                                  </TableCell>
                                )}
                                <TableCell>{formatTime(cls.time)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div
                                      className={`w-3 h-3 rounded-full ${classType.color} mr-2`}
                                    ></div>
                                    {classType.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarImage
                                        src={cls.instructor.avatar}
                                        alt={cls.instructor.name}
                                      />
                                      <AvatarFallback>
                                        {cls.instructor.name.substring(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span>{cls.instructor.name}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <IconUsers className="h-4 w-4 mr-1 text-muted-foreground" />
                                    <span
                                      className={
                                        cls.participants >= cls.maxParticipants
                                          ? "text-destructive"
                                          : ""
                                      }
                                    >
                                      {cls.participants}/{cls.maxParticipants}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  {(() => {
                                    // Check if class time has passed
                                    const classDateTime = new Date(cls.date);
                                    const [hours, minutes] = cls.time
                                      .split(":")
                                      .map(Number);
                                    classDateTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                    const isClassFinalized = isBefore(
                                      classDateTime,
                                      new Date()
                                    );

                                    if (isClassFinalized) {
                                      return (
                                        <Badge variant="outline">
                                          Finalizată
                                        </Badge>
                                      );
                                    }

                                    if (cls.enrolled) {
                                      return (
                                        <div className="flex items-center justify-end gap-2">
                                          <Badge variant="secondary">
                                            Înscris
                                          </Badge>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCancel(cls.id)}
                                            disabled={isEnrolling}
                                          >
                                            Anulează
                                          </Button>
                                        </div>
                                      );
                                    } else {
                                      return (
                                        <Button
                                          size="sm"
                                          variant={
                                            cls.participants >=
                                            cls.maxParticipants
                                              ? "outline"
                                              : "default"
                                          }
                                          disabled={
                                            cls.participants >=
                                              cls.maxParticipants ||
                                            !claseData.utilizator
                                              .areAbonamentValabil
                                          }
                                          onClick={() => handleEnroll(cls)}
                                        >
                                          {cls.participants >=
                                          cls.maxParticipants
                                            ? "Complet"
                                            : !claseData.utilizator
                                                  .areAbonamentValabil
                                              ? "Abonament necesar"
                                              : "Înscrie-te"}
                                        </Button>
                                      );
                                    }
                                  })()}
                                </TableCell>
                              </TableRow>
                            );
                          });
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-classes" className="space-y-6 mt-6">
            {claseData?.utilizator.tipAbonament === "Standard" ||
            claseData?.utilizator.tipAbonament === null ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Acces restricționat
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {claseData?.utilizator.tipAbonament === null
                      ? "Pentru a participa la clasele de grup, ai nevoie de un abonament Standard+ sau Premium."
                      : "Abonamentul Standard nu include accesul la clasele de grup. Ai nevoie de Standard+ sau Premium."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {claseData?.utilizator.tipAbonament === null ? (
                      <>
                        <Button asChild variant="outline">
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Cumpără Standard+
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Cumpără Premium
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button asChild variant="outline">
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Upgrade la Standard+
                          </Link>
                        </Button>
                        <Button asChild>
                          <Link href="/dashboard/membru/abonamentul-meu">
                            Upgrade la Premium
                          </Link>
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconBarbell className="h-5 w-5" /> Clasele mele
                  </CardTitle>
                  <CardDescription>
                    Istoricul claselor la care ești înscris
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {claseData.claseUtilizator.length > 0 ? (
                    <div className="space-y-4">
                      {claseData.claseUtilizator.map((cls) => {
                        const classType = getClassType(cls.typeId);
                        const classDate = new Date(cls.date);
                        return (
                          <Card key={cls.id} className="overflow-hidden">
                            <div className={`h-1 ${classType.color}`}></div>
                            <CardContent className="p-4">
                              <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div className="flex items-start space-x-4">
                                  <div
                                    className={`p-3 rounded-full ${
                                      classType.color
                                    } bg-opacity-10 text-${classType.color.replace(
                                      "bg-",
                                      ""
                                    )}`}
                                  >
                                    <IconBarbell className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">
                                      {classType.name}
                                    </h4>
                                    <div className="flex items-center mt-1 text-sm text-muted-foreground">
                                      <span>
                                        {format(classDate, "d MMMM yyyy", {
                                          locale: ro,
                                        })}
                                      </span>
                                      <span className="mx-2">•</span>
                                      <span>{formatTime(cls.time)}</span>
                                    </div>
                                    <div className="flex items-center mt-2">
                                      <Avatar className="h-6 w-6 mr-2">
                                        <AvatarImage
                                          src={cls.instructor.avatar}
                                          alt={cls.instructor.name}
                                        />
                                        <AvatarFallback>
                                          {cls.instructor.name.substring(0, 2)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {cls.instructor.name}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-4 md:mt-0">
                                  {(() => {
                                    // Check if class time has passed
                                    const classDateTime = new Date(cls.date);
                                    const [hours, minutes] = cls.time
                                      .split(":")
                                      .map(Number);
                                    classDateTime.setHours(
                                      hours,
                                      minutes,
                                      0,
                                      0
                                    );
                                    const isClassFinalized = isBefore(
                                      classDateTime,
                                      new Date()
                                    );

                                    if (isClassFinalized) {
                                      return (
                                        <Badge variant="outline">
                                          Finalizată
                                        </Badge>
                                      );
                                    }

                                    return (
                                      <>
                                        <Badge
                                          variant={
                                            cls.status === "prezent"
                                              ? "default"
                                              : cls.status === "anulat"
                                                ? "destructive"
                                                : "secondary"
                                          }
                                        >
                                          {cls.status === "inscris"
                                            ? "Înscris"
                                            : cls.status === "anulat"
                                              ? "Anulat"
                                              : "Prezent"}
                                        </Badge>
                                        {cls.status === "inscris" && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="ml-2"
                                            onClick={() => handleCancel(cls.id)}
                                            disabled={isEnrolling}
                                          >
                                            Anulează
                                          </Button>
                                        )}
                                      </>
                                    );
                                  })()}
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
                        Nu ești înscris la nicio clasă momentan
                      </p>
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => setActiveTab("list")}
                      >
                        Descoperă clasele disponibile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmare înscriere</DialogTitle>
            <DialogDescription>
              Ești pe cale să te înscrii la clasa de{" "}
              {selectedClass && getClassType(selectedClass.typeId).name}.
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="py-4">
              <div className="flex items-center space-x-2 mb-4">
                <div
                  className={`w-3 h-3 rounded-full ${
                    getClassType(selectedClass.typeId).color
                  }`}
                ></div>
                <span className="font-medium">
                  {getClassType(selectedClass.typeId).name}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(selectedClass.date), "d MMMM yyyy", {
                      locale: ro,
                    })}
                    , {selectedClass.time}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <IconUsers className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {selectedClass.participants}/{selectedClass.maxParticipants}{" "}
                    participanți
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={selectedClass.instructor.avatar}
                      alt={selectedClass.instructor.name}
                    />
                    <AvatarFallback>
                      {selectedClass.instructor.name.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <span>Instructor: {selectedClass.instructor.name}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anulează
            </Button>
            <Button onClick={confirmEnroll} disabled={isEnrolling}>
              {isEnrolling ? "Se procesează..." : "Confirmă înscrierea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
