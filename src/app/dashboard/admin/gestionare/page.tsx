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
  IconPlus,
  IconEdit,
  IconTrash,
  IconSettings,
  IconAlertTriangle,
  IconCheck,
  IconTool,
  IconBarbell,
  IconSearch,
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
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Mock data for class types
const classTypes = [
  { id: 1, name: "Pilates", color: "bg-pink-500" },
  { id: 2, name: "Yoga", color: "bg-purple-500" },
  { id: 3, name: "Spinning", color: "bg-blue-500" },
  { id: 4, name: "Zumba", color: "bg-yellow-500" },
  { id: 5, name: "Crossfit", color: "bg-red-500" },
  { id: 6, name: "Body Pump", color: "bg-green-500" },
];

// Mock data for trainers
const trainers = [
  {
    id: 1,
    name: "Maria Ionescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Fitness General, Crossfit",
    status: "active",
  },
  {
    id: 2,
    name: "Andrei Popescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Bodybuilding, Powerlifting",
    status: "active",
  },
  {
    id: 3,
    name: "Elena Dumitrescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Yoga, Pilates, Wellness",
    status: "active",
  },
  {
    id: 4,
    name: "Alexandru Stanescu",
    avatar: "/avatar-placeholder.png",
    specialization: "Functional Training, TRX",
    status: "active",
  },
];

// Mock data for equipment
const equipment = [
  {
    id: 1,
    name: "Banda de alergare Technogym",
    category: "Cardio",
    location: "Sala Cardio",
    status: "functional", // functional, maintenance, broken, retired
    lastMaintenance: new Date(2025, 4, 15),
    nextMaintenance: new Date(2025, 6, 15),
    purchaseDate: new Date(2023, 2, 10),
    warranty: new Date(2026, 2, 10),
    notes: "Funcționează perfect, verificare lunară programată",
  },
  {
    id: 2,
    name: "Bicicletă spinning Matrix",
    category: "Cardio",
    location: "Sala Spinning",
    status: "maintenance",
    lastMaintenance: new Date(2025, 5, 1),
    nextMaintenance: new Date(2025, 7, 1),
    purchaseDate: new Date(2024, 0, 20),
    warranty: new Date(2027, 0, 20),
    notes: "În service - probleme la sistemul de frânare",
  },
  {
    id: 3,
    name: "Set gantere York 5-50kg",
    category: "Greutăți libere",
    location: "Sala Greutăți",
    status: "functional",
    lastMaintenance: new Date(2025, 4, 20),
    nextMaintenance: new Date(2025, 7, 20),
    purchaseDate: new Date(2022, 5, 5),
    warranty: new Date(2025, 5, 5),
    notes: "Set complet, toate greutățile funcționale",
  },
  {
    id: 4,
    name: "Aparat multifuncțional Hammer",
    category: "Aparate",
    location: "Sala Aparate",
    status: "broken",
    lastMaintenance: new Date(2025, 3, 10),
    nextMaintenance: new Date(2025, 6, 10),
    purchaseDate: new Date(2023, 8, 15),
    warranty: new Date(2026, 8, 15),
    notes: "Defect la sistemul de cablu - necesită înlocuire",
  },
  {
    id: 5,
    name: "Colaci TRX (Set 10 buc)",
    category: "Accesorii",
    location: "Sala Funcțional",
    status: "functional",
    lastMaintenance: new Date(2025, 5, 1),
    nextMaintenance: new Date(2025, 8, 1),
    purchaseDate: new Date(2024, 1, 12),
    warranty: new Date(2026, 1, 12),
    notes: "Toate colacele în stare bună",
  },
  {
    id: 6,
    name: "Eliptică Life Fitness",
    category: "Cardio",
    location: "Sala Cardio",
    status: "maintenance",
    lastMaintenance: new Date(2025, 5, 2),
    nextMaintenance: new Date(2025, 8, 2),
    purchaseDate: new Date(2023, 10, 8),
    warranty: new Date(2026, 10, 8),
    notes: "Revizie programată - calibrare senzori",
  },
];

// Mock data for scheduled group classes
const scheduledClasses = [
  {
    id: 1,
    classTypeId: 1,
    trainerId: 1,
    date: new Date(2025, 5, 2, 10, 0),
    duration: 60,
    maxParticipants: 20,
    currentParticipants: 15,
    location: "Sala 1",
    status: "scheduled",
    equipmentNeeded: [1, 5],
  },
  {
    id: 2,
    classTypeId: 5,
    trainerId: 1,
    date: new Date(2025, 5, 2, 15, 0),
    duration: 60,
    maxParticipants: 15,
    currentParticipants: 12,
    location: "Sala 2",
    status: "scheduled",
    equipmentNeeded: [3],
  },
  {
    id: 3,
    classTypeId: 2,
    trainerId: 3,
    date: new Date(2025, 5, 3, 9, 0),
    duration: 75,
    maxParticipants: 15,
    currentParticipants: 8,
    location: "Sala Yoga",
    status: "scheduled",
    equipmentNeeded: [5],
  },
  {
    id: 4,
    classTypeId: 3,
    trainerId: 2,
    date: new Date(2025, 5, 4, 18, 0),
    duration: 45,
    maxParticipants: 25,
    currentParticipants: 20,
    location: "Sala Spinning",
    status: "scheduled",
    equipmentNeeded: [2],
  },
  {
    id: 5,
    classTypeId: 6,
    trainerId: 4,
    date: new Date(2025, 5, 5, 11, 0),
    duration: 60,
    maxParticipants: 20,
    currentParticipants: 18,
    location: "Sala Aparate",
    status: "scheduled",
    equipmentNeeded: [3, 4],
  },
];

export default function Page() {
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  // Define a type for scheduled classes
  type ScheduledClass = {
    id: number;
    classTypeId: number;
    trainerId: number;
    date: Date;
    duration: number;
    maxParticipants: number;
    currentParticipants: number;
    location: string;
    status: string;
    equipmentNeeded: number[];
  };

  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(
    null
  );

  // Define a type for equipment
  type Equipment = {
    id: number;
    name: string;
    category: string;
    location: string;
    status: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
    purchaseDate: Date;
    warranty: Date;
    notes: string;
  };

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // New class form state
  const [newClass, setNewClass] = useState({
    classTypeId: "",
    trainerId: "",
    date: "",
    time: "",
    duration: 60,
    maxParticipants: 20,
    location: "",
    equipmentNeeded: [] as number[],
  });

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    status: "",
    notes: "",
    nextMaintenance: "",
  });

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

  // Get classes for a specific date
  const getClassesForDate = (date: Date) => {
    return scheduledClasses
      .filter((cls) => isSameDay(new Date(cls.date), date))
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

  // Get trainer by ID
  const getTrainer = (trainerId: number) => {
    return trainers.find((trainer) => trainer.id === trainerId);
  };

  // Filter equipment
  const filteredEquipment = equipment.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Format time from date
  const formatTime = (date: Date) => {
    return format(date, "HH:mm");
  };

  // Handle class actions
  const handleViewClass = (cls: ScheduledClass) => {
    setSelectedClass(cls);
    setClassDialogOpen(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setEquipmentForm({
      status: item.status,
      notes: item.notes,
      nextMaintenance: format(item.nextMaintenance, "yyyy-MM-dd"),
    });
    setEquipmentDialogOpen(true);
  };

  const saveEquipmentChanges = () => {
    if (selectedEquipment) {
      // In a real app, you would call an API to update equipment
      console.log("Equipment updated:", {
        ...selectedEquipment,
        ...equipmentForm,
      });
      setEquipmentDialogOpen(false);
      setSelectedEquipment(null);
    }
  };

  const saveNewClass = () => {
    if (
      newClass.classTypeId &&
      newClass.trainerId &&
      newClass.date &&
      newClass.time
    ) {
      // In a real app, you would call an API to create the class
      console.log("New class created:", newClass);
      setNewClassDialogOpen(false);
      setNewClass({
        classTypeId: "",
        trainerId: "",
        date: "",
        time: "",
        duration: 60,
        maxParticipants: 20,
        location: "",
        equipmentNeeded: [],
      });
    }
  };

  // Get equipment status color
  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case "functional":
        return "default";
      case "maintenance":
        return "secondary";
      case "broken":
        return "destructive";
      case "retired":
        return "outline";
      default:
        return "secondary";
    }
  };

  // Get equipment status text
  const getEquipmentStatusText = (status: string) => {
    switch (status) {
      case "functional":
        return "Funcțional";
      case "maintenance":
        return "Mentenanță";
      case "broken":
        return "Defect";
      case "retired":
        return "Retras";
      default:
        return "Unknown";
    }
  };

  // Get week statistics
  const getWeekStats = () => {
    const weekClasses = scheduledClasses.filter((cls) => {
      const classDate = new Date(cls.date);
      return classDate >= weekStart && classDate <= weekEnd;
    });

    const totalClasses = weekClasses.length;
    const totalParticipants = weekClasses.reduce(
      (sum, cls) => sum + cls.currentParticipants,
      0
    );

    const equipmentStats = {
      functional: equipment.filter((e) => e.status === "functional").length,
      maintenance: equipment.filter((e) => e.status === "maintenance").length,
      broken: equipment.filter((e) => e.status === "broken").length,
      total: equipment.length,
    };

    return {
      classes: totalClasses,
      participants: totalParticipants,
      equipment: equipmentStats,
    };
  };

  const stats = getWeekStats();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestionare sală</h1>
            <p className="text-muted-foreground mt-1">
              Gestionează clasele de grup, antrenorii și echipamentele
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button onClick={() => setNewClassDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-1" />
              Clasă nouă
            </Button>
          </div>
        </div>

        {/* Week Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">
                {stats.classes}
              </div>
              <div className="text-sm text-muted-foreground">
                Clase programate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.participants}
              </div>
              <div className="text-sm text-muted-foreground">
                Participanți totali
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.equipment.functional}
              </div>
              <div className="text-sm text-muted-foreground">
                Echipamente funcționale
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.equipment.broken + stats.equipment.maintenance}
              </div>
              <div className="text-sm text-muted-foreground">
                Necesită atenție
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="w-full">
          <TabsList>
            <TabsTrigger value="schedule">Program săptămânal</TabsTrigger>
            <TabsTrigger value="equipment">
              Echipamente ({equipment.length})
            </TabsTrigger>
          </TabsList>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <IconCalendar className="h-5 w-5" /> Program clase de grup
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
                  Toate clasele de grup programate și asignate antrenorilor
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
                        <TableHead>Antrenor</TableHead>
                        <TableHead>Participanți</TableHead>
                        <TableHead>Locația</TableHead>
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
                                colSpan={6}
                                className="text-center text-muted-foreground"
                              >
                                Nu sunt clase programate
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return dayClasses.map((cls, index) => {
                          const classType = getClassType(cls.classTypeId);
                          const trainer = getTrainer(cls.trainerId);

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
                              <TableCell>
                                <div className="flex items-center">
                                  <IconClock className="h-4 w-4 mr-1 text-muted-foreground" />
                                  {formatTime(cls.date)} -{" "}
                                  {formatTime(
                                    addHours(cls.date, cls.duration / 60)
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div
                                    className={`w-3 h-3 rounded-full ${classType.color} mr-2`}
                                  ></div>
                                  <span className="font-medium">
                                    {classType.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={trainer?.avatar}
                                      alt={trainer?.name}
                                    />
                                    <AvatarFallback>
                                      {trainer?.name.substring(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {trainer?.name}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <IconUsers className="h-4 w-4 mr-1 text-muted-foreground" />
                                  <span
                                    className={
                                      cls.currentParticipants >=
                                      cls.maxParticipants
                                        ? "text-red-600 font-semibold"
                                        : ""
                                    }
                                  >
                                    {cls.currentParticipants}/
                                    {cls.maxParticipants}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="text-sm">{cls.location}</span>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewClass(cls)}
                                  >
                                    <IconEdit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    <IconTrash className="h-4 w-4" />
                                  </Button>
                                </div>
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

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-6 mt-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Caută echipamente după nume sau locație..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtru status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate statusurile</SelectItem>
                  <SelectItem value="functional">Funcțional</SelectItem>
                  <SelectItem value="maintenance">Mentenanță</SelectItem>
                  <SelectItem value="broken">Defect</SelectItem>
                  <SelectItem value="retired">Retras</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtru categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toate categoriile</SelectItem>
                  <SelectItem value="Cardio">Cardio</SelectItem>
                  <SelectItem value="Greutăți libere">
                    Greutăți libere
                  </SelectItem>
                  <SelectItem value="Aparate">Aparate</SelectItem>
                  <SelectItem value="Accesorii">Accesorii</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTool className="h-5 w-5" /> Inventar echipamente
                </CardTitle>
                <CardDescription>
                  Gestionează și monitorizează statusul echipamentelor din sală
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEquipment.length > 0 ? (
                  <div className="space-y-4">
                    {filteredEquipment.map((item) => (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="p-3 rounded-full bg-muted">
                                {item.category === "Cardio" && (
                                  <IconBarbell className="h-6 w-6" />
                                )}
                                {item.category === "Greutăți libere" && (
                                  <IconBarbell className="h-6 w-6" />
                                )}
                                {item.category === "Aparate" && (
                                  <IconSettings className="h-6 w-6" />
                                )}
                                {item.category === "Accesorii" && (
                                  <IconTool className="h-6 w-6" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <Badge variant="outline">
                                    {item.category}
                                  </Badge>
                                  <Badge
                                    variant={getEquipmentStatusColor(
                                      item.status
                                    )}
                                  >
                                    {getEquipmentStatusText(item.status)}
                                  </Badge>
                                  {item.status === "broken" && (
                                    <IconAlertTriangle className="h-4 w-4 text-red-600" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  📍 {item.location}
                                </p>
                                <div className="text-sm text-muted-foreground">
                                  <div>
                                    Última mentenanță:{" "}
                                    {format(
                                      item.lastMaintenance,
                                      "d MMMM yyyy",
                                      { locale: ro }
                                    )}
                                  </div>
                                  <div>
                                    Următoarea mentenanță:{" "}
                                    {format(
                                      item.nextMaintenance,
                                      "d MMMM yyyy",
                                      { locale: ro }
                                    )}
                                  </div>
                                  {item.notes && (
                                    <div className="mt-1 italic">
                                      &quot;{item.notes}&quot;
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditEquipment(item)}
                              >
                                <IconEdit className="h-4 w-4 mr-1" />
                                Editează
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8 bg-muted rounded-md">
                    <IconTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Nu s-au găsit echipamente care să corespundă criteriilor
                      de căutare
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View/Edit Class Dialog */}
      <Dialog open={classDialogOpen} onOpenChange={setClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalii clasă</DialogTitle>
            <DialogDescription>
              Vizualizează și editează informațiile clasei
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`p-3 rounded-full ${
                    getClassType(selectedClass.classTypeId).color
                  } bg-opacity-10`}
                >
                  <IconUsers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {getClassType(selectedClass.classTypeId).name}
                  </h3>
                  <p className="text-muted-foreground">
                    {format(selectedClass.date, "d MMMM yyyy, HH:mm", {
                      locale: ro,
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Antrenor:</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={getTrainer(selectedClass.trainerId)?.avatar}
                        alt={getTrainer(selectedClass.trainerId)?.name}
                      />
                      <AvatarFallback>
                        {getTrainer(selectedClass.trainerId)?.name.substring(
                          0,
                          2
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getTrainer(selectedClass.trainerId)?.name}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Locația:</Label>
                  <div className="mt-1">{selectedClass.location}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Durata:</Label>
                  <div className="mt-1">{selectedClass.duration} minute</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Participanți:</Label>
                  <div className="mt-1">
                    {selectedClass.currentParticipants}/
                    {selectedClass.maxParticipants}
                  </div>
                </div>
              </div>

              {selectedClass.equipmentNeeded &&
                selectedClass.equipmentNeeded.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Echipamente necesare:
                    </Label>
                    <div className="mt-2 space-y-1">
                      {selectedClass.equipmentNeeded.map((equipId: number) => {
                        const equip = equipment.find((e) => e.id === equipId);
                        return equip ? (
                          <div
                            key={equipId}
                            className="flex items-center space-x-2"
                          >
                            <Badge variant="outline">{equip.name}</Badge>
                            <Badge
                              variant={getEquipmentStatusColor(equip.status)}
                            >
                              {getEquipmentStatusText(equip.status)}
                            </Badge>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>
              Închide
            </Button>
            <Button>
              <IconEdit className="h-4 w-4 mr-1" />
              Editează clasa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Edit Dialog */}
      <Dialog open={equipmentDialogOpen} onOpenChange={setEquipmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Actualizează echipament</DialogTitle>
            <DialogDescription>
              Modifică statusul și notele pentru echipament
            </DialogDescription>
          </DialogHeader>

          {selectedEquipment && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={equipmentForm.status}
                  onValueChange={(value) =>
                    setEquipmentForm({ ...equipmentForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează statusul" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="functional">Funcțional</SelectItem>
                    <SelectItem value="maintenance">Mentenanță</SelectItem>
                    <SelectItem value="broken">Defect</SelectItem>
                    <SelectItem value="retired">Retras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextMaintenance">Următoarea mentenanță</Label>
                <Input
                  type="date"
                  value={equipmentForm.nextMaintenance}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      nextMaintenance: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Note</Label>
                <Textarea
                  value={equipmentForm.notes}
                  onChange={(e) =>
                    setEquipmentForm({
                      ...equipmentForm,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Adaugă note despre starea echipamentului..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEquipmentDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button onClick={saveEquipmentChanges}>
              <IconCheck className="h-4 w-4 mr-1" />
              Salvează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Class Dialog */}
      <Dialog open={newClassDialogOpen} onOpenChange={setNewClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Programează clasă nouă</DialogTitle>
            <DialogDescription>
              Creează și asignează o clasă de grup unui antrenor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="classType">Tipul clasei</Label>
                <Select
                  value={newClass.classTypeId}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, classTypeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tipul clasei" />
                  </SelectTrigger>
                  <SelectContent>
                    {classTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${type.color}`}
                          ></div>
                          <span>{type.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trainer">Antrenor</Label>
                <Select
                  value={newClass.trainerId}
                  onValueChange={(value) =>
                    setNewClass({ ...newClass, trainerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează antrenorul" />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem
                        key={trainer.id}
                        value={trainer.id.toString()}
                      >
                        {trainer.name} - {trainer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  type="date"
                  value={newClass.date}
                  onChange={(e) =>
                    setNewClass({ ...newClass, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Ora</Label>
                <Input
                  type="time"
                  value={newClass.time}
                  onChange={(e) =>
                    setNewClass({ ...newClass, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Durata (min)</Label>
                <Input
                  type="number"
                  value={newClass.duration}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="30"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Max participanți</Label>
                <Input
                  type="number"
                  value={newClass.maxParticipants}
                  onChange={(e) =>
                    setNewClass({
                      ...newClass,
                      maxParticipants: parseInt(e.target.value),
                    })
                  }
                  min="5"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Locația</Label>
                <Input
                  value={newClass.location}
                  onChange={(e) =>
                    setNewClass({ ...newClass, location: e.target.value })
                  }
                  placeholder="Ex: Sala 1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewClassDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              onClick={saveNewClass}
              disabled={
                !newClass.classTypeId ||
                !newClass.trainerId ||
                !newClass.date ||
                !newClass.time
              }
            >
              <IconPlus className="h-4 w-4 mr-1" />
              Programează clasa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
