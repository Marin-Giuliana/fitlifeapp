"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addHours,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconClock,
  IconUsers,
  IconUser,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Interface definitions
interface ClassType {
  id: number;
  name: string;
  color: string;
}

interface Client {
  id: string;
  name: string;
  avatar: string;
}

interface GroupSession {
  id: string;
  type: "group";
  classTypeId: number;
  classTypeName: string;
  classTypeColor: string;
  date: string;
  time: string;
  duration: number;
  participants: number;
  maxParticipants: number;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
}

interface PrivateSession {
  id: string;
  type: "private";
  date: string;
  time: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  client: Client;
  location: string;
}

type TrainerSession = GroupSession | PrivateSession;

interface OrarData {
  antrenor: {
    nume: string;
    email: string;
    specializari: string[];
  };
  sesiuni: TrainerSession[];
  tipuriClase: ClassType[];
  perioada: {
    startDate: string;
    endDate: string;
  };
  statistici: {
    totalSesiuni: number;
    sesiuniFinalizate: number;
    claseGrup: number;
    sesiuniPrivate: number;
  };
}

export default function Page() {
  const { data: session } = useSession();
  const [orarData, setOrarData] = useState<OrarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Fetch data function
  const fetchOrarData = useCallback(
    async (weekStartParam?: Date, skipLoading = false) => {
      try {
        if (!skipLoading) {
          setIsLoading(true);
        }
        const searchDate = weekStartParam || weekStart;
        const weekStartISO = searchDate.toISOString();

        const response = await fetch(
          `/api/antrenor/orar?weekStart=${weekStartISO}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrarData(data);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Eroare la încărcarea orarului");
        }
      } catch (error) {
        console.error("Eroare la încărcarea orarului:", error);
        toast.error("Eroare la încărcarea orarului");
      } finally {
        if (!skipLoading) {
          setIsLoading(false);
        }
      }
    },
    [weekStart]
  );

  useEffect(() => {
    if (session) {
      fetchOrarData();
    }
  }, [session, fetchOrarData]);

  // Calculate weekEnd based on weekStart
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation for week view
  const previousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
    fetchOrarData(newWeekStart);
  };

  const nextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
    fetchOrarData(newWeekStart);
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    if (!orarData) return [];
    return orarData.sesiuni
      .filter((session) => isSameDay(new Date(session.date), date))
      .sort(
        (a, b) =>
          new Date(a.date + " " + a.time).getTime() -
          new Date(b.date + " " + b.time).getTime()
      );
  };

  // Get class type by ID
  const getClassType = (typeId: number) => {
    if (!orarData) return { name: "Unknown", color: "bg-gray-500" };
    return (
      orarData.tipuriClase.find((type) => type.id === typeId) || {
        name: "Unknown",
        color: "bg-gray-500",
      }
    );
  };

  // Format time from string
  const formatTime = (time: string) => {
    return time;
  };

  const stats = orarData?.statistici || {
    totalSesiuni: 0,
    sesiuniFinalizate: 0,
    claseGrup: 0,
    sesiuniPrivate: 0,
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!orarData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele orarului.
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
            <h1 className="text-3xl font-bold">Orarul meu</h1>
            <p className="text-muted-foreground mt-1">
              Vizualizează și gestionează programul tău săptămânal
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {stats.totalSesiuni} ședințe această săptămână
            </Badge>
            <Badge variant="secondary">
              {stats.sesiuniFinalizate} finalizate
            </Badge>
          </div>
        </div>

        {/* Week Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.totalSesiuni}
              </div>
              <div className="text-sm text-muted-foreground">Total ședințe</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.sesiuniFinalizate}
              </div>
              <div className="text-sm text-muted-foreground">Finalizate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.claseGrup}
              </div>
              <div className="text-sm text-muted-foreground">Clase de grup</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.sesiuniPrivate}
              </div>
              <div className="text-sm text-muted-foreground">
                Ședințe private
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Calendar */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <IconCalendar className="h-5 w-5" /> Programul săptămânal
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousWeek}>
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
              Toate clasele de grup și ședințele private asignate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zi</TableHead>
                    <TableHead>Oră</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Detalii</TableHead>
                    <TableHead>Locația</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {weekDays.map((day) => {
                    const daySessions = getSessionsForDate(day);
                    if (daySessions.length === 0) {
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
                            Nu ai ședințe programate
                          </TableCell>
                        </TableRow>
                      );
                    }

                    return daySessions.map((session, index) => {
                      const isGroupClass = session.type === "group";
                      const classType = isGroupClass
                        ? getClassType(session.classTypeId)
                        : null;

                      return (
                        <TableRow key={session.id}>
                          {index === 0 && (
                            <TableCell
                              className="font-medium"
                              rowSpan={daySessions.length}
                            >
                              {format(day, "EEEE", { locale: ro })}
                              <div className="text-xs text-muted-foreground">
                                {format(day, "d MMM", { locale: ro })}
                              </div>
                            </TableCell>
                          )}
                          <TableCell>
                            <div className="flex items-center">
                              <IconClock className="h-4 w-4 mr-1 text-muted-foreground" />
                              {formatTime(session.time)} -{" "}
                              {format(
                                addHours(
                                  new Date(`2000-01-01T${session.time}`),
                                  session.duration / 60
                                ),
                                "HH:mm"
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {isGroupClass ? (
                              <div className="flex items-center">
                                <IconUsers className="h-4 w-4 mr-2 text-blue-600" />
                                <span className="text-blue-600">
                                  Clasă de grup
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <IconUser className="h-4 w-4 mr-2 text-purple-600" />
                                <span className="text-purple-600">
                                  Ședință privată
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {isGroupClass ? (
                              <div>
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full ${classType?.color} mr-2`}
                                  ></div>
                                  <span className="font-medium">
                                    {classType?.name}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {session.participants}/
                                  {session.maxParticipants} participanți
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={session.client.avatar}
                                    alt={session.client.name}
                                  />
                                  <AvatarFallback>
                                    {session.client.name.substring(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {session.client.name}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{session.location}</span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                session.status === "completed"
                                  ? "default"
                                  : session.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {session.status === "completed"
                                ? "Finalizată"
                                : session.status === "cancelled"
                                ? "Anulată"
                                : "Programată"}
                            </Badge>
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
      </div>
    </div>
  );
}
