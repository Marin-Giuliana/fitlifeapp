"use client";

import { useState } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { ro } from "date-fns/locale";
import {
  IconBarbell,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconUsers,
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

// Mock data for class types
const classTypes = [
  { id: 1, name: "Pilates", color: "bg-pink-500" },
  { id: 2, name: "Yoga", color: "bg-purple-500" },
  { id: 3, name: "Spinning", color: "bg-blue-500" },
  { id: 4, name: "Zumba", color: "bg-yellow-500" },
  { id: 5, name: "Crossfit", color: "bg-red-500" },
  { id: 6, name: "Body Pump", color: "bg-green-500" },
];

// Mock data for classes
const mockClasses = [
  {
    id: 1,
    typeId: 1,
    date: new Date(2025, 4, 22, 10, 0),
    instructor: {
      id: 1,
      name: "Maria Ionescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 12,
    maxParticipants: 20,
    enrolled: false,
  },
  {
    id: 2,
    typeId: 2,
    date: new Date(2025, 4, 22, 15, 0),
    instructor: {
      id: 2,
      name: "Andrei Popescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 8,
    maxParticipants: 15,
    enrolled: true,
  },
  {
    id: 3,
    typeId: 3,
    date: new Date(2025, 4, 23, 9, 0),
    instructor: {
      id: 3,
      name: "Elena Dumitrescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 18,
    maxParticipants: 20,
    enrolled: false,
  },
  {
    id: 4,
    typeId: 4,
    date: new Date(2025, 4, 23, 18, 0),
    instructor: {
      id: 1,
      name: "Maria Ionescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 15,
    maxParticipants: 25,
    enrolled: false,
  },
  {
    id: 5,
    typeId: 5,
    date: new Date(2025, 4, 24, 12, 0),
    instructor: {
      id: 4,
      name: "Alexandru Stanescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 10,
    maxParticipants: 15,
    enrolled: false,
  },
  {
    id: 6,
    typeId: 6,
    date: new Date(2025, 4, 24, 17, 0),
    instructor: {
      id: 2,
      name: "Andrei Popescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 12,
    maxParticipants: 20,
    enrolled: false,
  },
  {
    id: 7,
    typeId: 2,
    date: new Date(2025, 4, 25, 8, 0),
    instructor: {
      id: 3,
      name: "Elena Dumitrescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 5,
    maxParticipants: 15,
    enrolled: false,
  },
  {
    id: 8,
    typeId: 1,
    date: new Date(2025, 4, 25, 19, 0),
    instructor: {
      id: 1,
      name: "Maria Ionescu",
      avatar: "/avatar-placeholder.png",
    },
    participants: 12,
    maxParticipants: 20,
    enrolled: false,
  },
];

// Mock data for user's classes
const userClasses = [
  {
    id: 2,
    typeId: 2,
    date: new Date(2025, 4, 22, 15, 0),
    instructor: {
      id: 2,
      name: "Andrei Popescu",
      avatar: "/avatar-placeholder.png",
    },
    status: "inscris", // inscris, anulat, prezent
  },
];

// Define the type for a class
interface Instructor {
  id: number;
  name: string;
  avatar: string;
}

interface GroupClass {
  id: number;
  typeId: number;
  date: Date;
  instructor: Instructor;
  participants: number;
  maxParticipants: number;
  enrolled: boolean;
}

export default function Page() {
  const [selectedClass, setSelectedClass] = useState<GroupClass | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );

  // Calculate weekEnd based on weekStart
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Helper to get class type
  const getClassType = (typeId: number) => {
    return (
      classTypes.find((type) => type.id === typeId) || {
        name: "Unknown",
        color: "bg-gray-500",
      }
    );
  };

  // Filter classes for selected date
  const getClassesForDate = (date: Date) => {
    return mockClasses
      .filter((cls) => isSameDay(new Date(cls.date), date))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  // Format time from date
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Navigation for week view
  const previousWeek = () => {
    setWeekStart(addDays(weekStart, -7));
  };

  const nextWeek = () => {
    setWeekStart(addDays(weekStart, 7));
  };

  // Handle class enrollment
  const handleEnroll = (classItem: GroupClass) => {
    setSelectedClass(classItem);
    setDialogOpen(true);
  };

  // Confirm enrollment
  const confirmEnroll = () => {
    // In a real app, you would call an API to enroll
    console.log("Enrolled in class:", selectedClass);
    setDialogOpen(false);
  };

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
            {classTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-1">
                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                <span className="text-xs text-muted-foreground">
                  {type.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">Listă clase</TabsTrigger>
            <TabsTrigger value="my-classes">Clasele mele</TabsTrigger>
          </TabsList>

          {/* Week View */}
          <TabsContent value="list" className="space-y-6 mt-6">
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
                              <TableCell>{formatTime(cls.date)}</TableCell>
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
                                {cls.enrolled ? (
                                  <Badge variant="secondary">Înscris</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant={
                                      cls.participants >= cls.maxParticipants
                                        ? "outline"
                                        : "default"
                                    }
                                    disabled={
                                      cls.participants >= cls.maxParticipants
                                    }
                                    onClick={() => handleEnroll(cls)}
                                  >
                                    {cls.participants >= cls.maxParticipants
                                      ? "Complet"
                                      : "Înscrie-te"}
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
          </TabsContent>

          {/* My Classes */}
          <TabsContent value="my-classes" className="space-y-6 mt-6">
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
                {userClasses.length > 0 ? (
                  <div className="space-y-4">
                    {userClasses.map((cls) => {
                      const classType = getClassType(cls.typeId);
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
                                      {format(cls.date, "d MMMM yyyy", {
                                        locale: ro,
                                      })}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>{formatTime(cls.date)}</span>
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
                                  >
                                    Anulează
                                  </Button>
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
                      Nu ești înscris la nicio clasă momentan
                    </p>
                    <Button className="mt-4" variant="outline" asChild>
                      <a href="#calendar">Descoperă clasele disponibile</a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Enrollment Dialog */}
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
                    {format(selectedClass.date, "d MMMM yyyy, HH:mm", {
                      locale: ro,
                    })}
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
            <Button onClick={confirmEnroll}>Confirmă înscrierea</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// export default function Page() {
//   return <div>Clase de grup</div>;
// }
