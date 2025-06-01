"use client";

import { useState } from "react";
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
  IconCheck,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data for trainer (current logged in trainer)
// const currentTrainer = {
//   id: 1,
//   name: "Maria Ionescu",
//   avatar: "/avatar-placeholder.png",
//   specialization: "Fitness General, Crossfit",
// };

// Mock data for class types
const classTypes = [
  { id: 1, name: "Pilates", color: "bg-pink-500" },
  { id: 2, name: "Yoga", color: "bg-purple-500" },
  { id: 3, name: "Spinning", color: "bg-blue-500" },
  { id: 4, name: "Zumba", color: "bg-yellow-500" },
  { id: 5, name: "Crossfit", color: "bg-red-500" },
  { id: 6, name: "Body Pump", color: "bg-green-500" },
];

// Define a type for group and private sessions
type GroupSession = {
  id: number;
  type: "group";
  classTypeId: number;
  date: Date;
  duration: number;
  participants: number;
  maxParticipants: number;
  status: "scheduled" | "completed" | "cancelled";
  location: string;
};

type PrivateSession = {
  id: number;
  type: "private";
  date: Date;
  duration: number;
  status: "scheduled" | "completed" | "cancelled";
  client: {
    id: number;
    name: string;
    avatar: string;
  };
  location: string;
};

type TrainerSession = GroupSession | PrivateSession;

// Mock data for trainer's assigned sessions (group classes + private sessions)
const trainerSessions: TrainerSession[] = [
  // Group Classes
  {
    id: 1,
    type: "group",
    classTypeId: 1,
    date: new Date(2025, 5, 2, 10, 0),
    duration: 60,
    participants: 15,
    maxParticipants: 20,
    status: "scheduled", // scheduled, completed, cancelled
    location: "Sala 1",
  },
  {
    id: 2,
    type: "group",
    classTypeId: 5,
    date: new Date(2025, 5, 2, 15, 0),
    duration: 60,
    participants: 12,
    maxParticipants: 15,
    status: "scheduled",
    location: "Sala 2",
  },
  {
    id: 3,
    type: "group",
    classTypeId: 1,
    date: new Date(2025, 5, 3, 9, 0),
    duration: 60,
    participants: 18,
    maxParticipants: 20,
    status: "completed",
    location: "Sala 1",
  },
  {
    id: 4,
    type: "group",
    classTypeId: 5,
    date: new Date(2025, 5, 4, 16, 0),
    duration: 60,
    participants: 10,
    maxParticipants: 15,
    status: "scheduled",
    location: "Sala 2",
  },
  {
    id: 5,
    type: "group",
    classTypeId: 1,
    date: new Date(2025, 5, 5, 10, 0),
    duration: 60,
    participants: 8,
    maxParticipants: 20,
    status: "scheduled",
    location: "Sala 1",
  },
  {
    id: 6,
    type: "group",
    classTypeId: 5,
    date: new Date(2025, 5, 6, 17, 0),
    duration: 60,
    participants: 14,
    maxParticipants: 15,
    status: "scheduled",
    location: "Sala 2",
  },

  // Private Sessions
  {
    id: 7,
    type: "private",
    date: new Date(2025, 5, 2, 8, 0),
    duration: 60,
    status: "scheduled",
    client: {
      id: 1,
      name: "Alexandru Popescu",
      avatar: "/avatar-placeholder.png",
    },
    location: "Sala PT 1",
  },
  {
    id: 8,
    type: "private",
    date: new Date(2025, 5, 3, 11, 0),
    duration: 60,
    status: "completed",
    client: {
      id: 2,
      name: "Ana Ionescu",
      avatar: "/avatar-placeholder.png",
    },
    location: "Sala PT 2",
  },
  {
    id: 9,
    type: "private",
    date: new Date(2025, 5, 4, 9, 0),
    duration: 60,
    status: "scheduled",
    client: {
      id: 3,
      name: "Mihai Georgescu",
      avatar: "/avatar-placeholder.png",
    },
    location: "Sala PT 1",
  },
];

export default function Page() {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  const [selectedSession, setSelectedSession] = useState<TrainerSession | null>(
    null
  );
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);

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

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return trainerSessions
      .filter((session) => isSameDay(new Date(session.date), date))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Get class type by ID
  const getClassType = (typeId: number) => {
    return (
      classTypes.find((type) => type.id === typeId) || {
        name: "Unknown",
        color: "bg-gray-500",
      }
    );
  };

  // Format time from date
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Handle session completion
  const handleCompleteSession = (session: TrainerSession) => {
    setSelectedSession(session);
    setCompletionDialogOpen(true);
  };

  // Confirm session completion
  const confirmCompletion = () => {
    if (selectedSession) {
      // In a real app, you would call an API to mark session as completed
      console.log("Session completed:", selectedSession);
      setCompletionDialogOpen(false);
      setSelectedSession(null);
    }
  };

  // Get session statistics
  const getWeekStats = () => {
    const weekSessions = trainerSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart && sessionDate <= weekEnd;
    });

    const totalSessions = weekSessions.length;
    const completedSessions = weekSessions.filter(
      (s) => s.status === "completed"
    ).length;
    const groupClasses = weekSessions.filter((s) => s.type === "group").length;
    const privateSessions = weekSessions.filter(
      (s) => s.type === "private"
    ).length;

    return {
      total: totalSessions,
      completed: completedSessions,
      group: groupClasses,
      private: privateSessions,
    };
  };

  const stats = getWeekStats();

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
              {stats.total} ședințe această săptămână
            </Badge>
            <Badge variant="secondary">{stats.completed} finalizate</Badge>
          </div>
        </div>

        {/* Week Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.total}
              </div>
              <div className="text-sm text-muted-foreground">Total ședințe</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.completed}
              </div>
              <div className="text-sm text-muted-foreground">Finalizate</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.group}
              </div>
              <div className="text-sm text-muted-foreground">Clase de grup</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.private}
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
                    <TableHead className="text-right">Acțiuni</TableHead>
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
                            colSpan={6}
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
                              {formatTime(session.date)} -{" "}
                              {formatTime(addHours(session.date, 1))}
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
                          <TableCell className="text-right">
                            {session.status === "scheduled" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteSession(session)}
                              >
                                <IconCheck className="h-4 w-4 mr-1" />
                                Finalizează
                              </Button>
                            )}
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

      {/* Session Completion Dialog */}
      <Dialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalizează ședința</DialogTitle>
            <DialogDescription>
              Ești pe cale să marchezi această ședință ca finalizată.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted rounded-md">
                  {selectedSession.type === "group" ? (
                    <div
                      className={`p-2 rounded-full ${
                        getClassType(selectedSession.classTypeId).color
                      } bg-opacity-10`}
                    >
                      <IconUsers className="h-5 w-5" />
                    </div>
                  ) : (
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={selectedSession.client.avatar}
                        alt={selectedSession.client.name}
                      />
                      <AvatarFallback>
                        {selectedSession.client.name.substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div>
                    <div className="font-medium">
                      {selectedSession.type === "group"
                        ? `${
                            getClassType(selectedSession.classTypeId).name
                          } - Clasă de grup`
                        : `Ședință privată - ${selectedSession.client.name}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(selectedSession.date, "d MMMM yyyy, HH:mm", {
                        locale: ro,
                      })}{" "}
                      • {selectedSession.location}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span>Durata: {selectedSession.duration} minute</span>
                  </div>

                  {selectedSession.type === "group" && (
                    <div className="flex items-center space-x-2">
                      <IconUsers className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Participanți: {selectedSession.participants}/
                        {selectedSession.maxParticipants}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCompletionDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button onClick={confirmCompletion}>
              <IconCheck className="h-4 w-4 mr-1" />
              Confirmă finalizarea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
