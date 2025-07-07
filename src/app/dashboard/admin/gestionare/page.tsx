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
  IconPlus,
  IconEdit,
  IconTrash,
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

// Interface definitions
interface ClassType {
  id: number;
  name: string;
  color: string;
}

interface Trainer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialization: string;
  status: string;
}

interface Equipment {
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
}

interface ScheduledClass {
  id: string;
  classTypeId: number;
  trainerId: string;
  trainerName: string;
  date: string;
  time: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  location: string;
  status: string;
  classType: ClassType;
}

interface GestionareData {
  clase: ScheduledClass[];
  antrenori: Trainer[];
  tipuriClase: ClassType[];
  echipamente: Equipment[];
  perioada: {
    startDate: string;
    endDate: string;
  };
  statistici: {
    totalClase: number;
    totalParticipanti: number;
    echipamenteFunctionale: number;
    echipamenteDefecte: number;
  };
}

export default function Page() {
  const { data: session } = useSession();
  const [gestionareData, setGestionareData] = useState<GestionareData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedClass, setSelectedClass] = useState<ScheduledClass | null>(
    null
  );
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [equipmentDialogOpen, setEquipmentDialogOpen] = useState(false);
  const [newClassDialogOpen, setNewClassDialogOpen] = useState(false);
  const [newEquipmentDialogOpen, setNewEquipmentDialogOpen] = useState(false);
  const [editClassDialogOpen, setEditClassDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("schedule");

  // New class form state
  const [newClass, setNewClass] = useState({
    classTypeId: "",
    trainerId: "",
    date: "",
    time: "",
    duration: 60,
    maxParticipants: 20,
    location: "",
  });

  // Edit class form state
  const [editClass, setEditClass] = useState({
    classTypeId: "",
    trainerId: "",
    date: "",
    time: "",
    duration: 60,
    maxParticipants: 20,
    location: "",
  });

  // Fetch equipment data
  const fetchEquipmentData = useCallback(async () => {
    try {
      const response = await fetch("/api/echipamente");
      if (response.ok) {
        const data = await response.json();
        // Updatează echipamentele în gestionareData
        setGestionareData((prevData) => {
          if (prevData) {
            return {
              ...prevData,
              echipamente: data.echipamente || [],
            };
          }
          // Dacă nu există date anterioare, creează un obiect minim
          return {
            clase: [],
            antrenori: [],
            tipuriClase: [],
            echipamente: data.echipamente || [],
            perioada: {
              startDate: new Date().toISOString(),
              endDate: new Date().toISOString(),
            },
            statistici: {
              totalClase: 0,
              totalParticipanti: 0,
              echipamenteFunctionale: 0,
              echipamenteDefecte: 0,
            },
          };
        });
      } else {
        toast.error("Eroare la încărcarea echipamentelor");
      }
    } catch (error) {
      console.error("Eroare la încărcarea echipamentelor:", error);
      toast.error("Eroare la încărcarea echipamentelor");
    }
  }, []);

  // Fetch data function
  const fetchGestionareData = useCallback(
    async (weekStartParam?: Date) => {
      try {
        setIsLoading(true);
        const searchDate = weekStartParam || weekStart;
        const weekStartISO = searchDate.toISOString();

        const response = await fetch(
          `/api/admin/gestionare?weekStart=${weekStartISO}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Gestionare data:", data); // Debug log
          setGestionareData(data);
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Eroare la încărcarea datelor");
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
        toast.error("Eroare la încărcarea datelor");
      } finally {
        setIsLoading(false);
      }
    },
    [weekStart]
  );

  useEffect(() => {
    if (session) {
      fetchGestionareData();
    }
  }, [session, weekStart, fetchGestionareData]);

  // Equipment data is now loaded with main gestionare data

  // Equipment form state
  const [equipmentForm, setEquipmentForm] = useState({
    status: "",
    notes: "",
  });

  // New equipment form state
  const [newEquipment, setNewEquipment] = useState({
    denumire: "",
    producator: "",
    stare: "functional",
  });

  // Calculate weekEnd based on weekStart
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

  // Generate array of days for the week view
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Navigation for week view
  const previousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);
    setWeekStart(newWeekStart);
  };

  const nextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);
    setWeekStart(newWeekStart);
  };

  // Get classes for a specific date
  const getClassesForDate = (date: Date) => {
    if (!gestionareData) return [];
    console.log("Total classes available:", gestionareData.clase.length); // Debug log
    const filtered = gestionareData.clase
      .filter((cls) => isSameDay(new Date(cls.date), date))
      .sort(
        (a, b) =>
          new Date(a.date + " " + a.time).getTime() -
          new Date(b.date + " " + b.time).getTime()
      );
    console.log("Classes for date", date, ":", filtered); // Debug log
    return filtered;
  };

  // Get trainer by ID
  const getTrainer = (trainerId: string) => {
    if (!gestionareData) return null;
    return gestionareData.antrenori.find((trainer) => trainer.id === trainerId);
  };

  // Filter equipment
  const filteredEquipment = (gestionareData?.echipamente || []).filter(
    (item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    }
  );

  // Format time from string
  const formatTime = (time: string) => {
    return time;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!gestionareData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele de gestionare.
          </p>
        </div>
      </div>
    );
  }

  // Handle class actions
  const handleViewClass = (cls: ScheduledClass) => {
    setSelectedClass(cls);
    setClassDialogOpen(true);
  };

  const handleEditClass = (cls: ScheduledClass) => {
    setSelectedClass(cls);
    setEditClass({
      classTypeId: cls.classTypeId.toString(),
      trainerId: cls.trainerId,
      date: new Date(cls.date).toISOString().split("T")[0],
      time: cls.time,
      duration: cls.duration,
      maxParticipants: cls.maxParticipants,
      location: cls.location,
    });
    setClassDialogOpen(false);
    setEditClassDialogOpen(true);
  };

  const handleEditEquipment = (item: Equipment) => {
    setSelectedEquipment(item);
    setEquipmentForm({
      status: item.status,
      notes: "",
    });
    setEquipmentDialogOpen(true);
  };

  const saveEquipmentChanges = async () => {
    if (selectedEquipment) {
      try {
        setIsSaving(true);
        const response = await fetch("/api/echipamente", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: selectedEquipment.id,
            updates: {
              stare: mapStatusToBackend(equipmentForm.status),
            },
          }),
        });

        if (response.ok) {
          toast.success("Echipamentul a fost actualizat cu succes!");
          setEquipmentDialogOpen(false);
          setSelectedEquipment(null);
          fetchGestionareData(); // Refresh data
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.message || "Eroare la actualizarea echipamentului"
          );
        }
      } catch (error) {
        console.error("Eroare la actualizarea echipamentului:", error);
        toast.error("Eroare la actualizarea echipamentului");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const saveNewEquipment = async () => {
    if (newEquipment.denumire) {
      try {
        setIsSaving(true);
        const response = await fetch("/api/echipamente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...newEquipment,
            dataAchizitionare: new Date().toISOString(),
          }),
        });

        if (response.ok) {
          toast.success("Echipamentul a fost adăugat cu succes!");
          setNewEquipmentDialogOpen(false);
          setNewEquipment({
            denumire: "",
            producator: "",
            stare: "functional",
          });
          fetchEquipmentData(); // Refresh equipment data
        } else {
          const errorData = await response.json();
          toast.error(
            errorData.message || "Eroare la adăugarea echipamentului"
          );
        }
      } catch (error) {
        console.error("Eroare la adăugarea echipamentului:", error);
        toast.error("Eroare la adăugarea echipamentului");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const deleteEquipment = async (equipmentId: string | number) => {
    try {
      const response = await fetch(`/api/echipamente?id=${equipmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Echipamentul a fost șters cu succes!");
        fetchEquipmentData(); // Refresh equipment data
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Eroare la ștergerea echipamentului");
      }
    } catch (error) {
      console.error("Eroare la ștergerea echipamentului:", error);
      toast.error("Eroare la ștergerea echipamentului");
    }
  };

  // Helper function to map status from frontend to backend
  const mapStatusToBackend = (frontendStatus: string): string => {
    switch (frontendStatus) {
      case "functional":
        return "functional";
      case "maintenance":
        return "service";
      case "broken":
        return "defect";
      case "retired":
        return "defect"; // Map retired to defect for now
      default:
        return "functional";
    }
  };

  const saveNewClass = async () => {
    if (
      newClass.classTypeId &&
      newClass.trainerId &&
      newClass.date &&
      newClass.time
    ) {
      try {
        setIsSaving(true);
        const response = await fetch("/api/admin/gestionare", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newClass),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(result.message);
          setNewClassDialogOpen(false);
          setNewClass({
            classTypeId: "",
            trainerId: "",
            date: "",
            time: "",
            duration: 60,
            maxParticipants: 20,
            location: "",
          });
          fetchGestionareData(); // Refresh data
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Eroare la crearea clasei");
        }
      } catch (error) {
        console.error("Eroare la crearea clasei:", error);
        toast.error("Eroare la crearea clasei");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const saveEditedClass = async () => {
    if (
      selectedClass &&
      editClass.classTypeId &&
      editClass.trainerId &&
      editClass.date &&
      editClass.time
    ) {
      try {
        setIsSaving(true);
        const response = await fetch("/api/admin/gestionare", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clasaId: selectedClass.id,
            ...editClass,
            maxParticipants: editClass.maxParticipants,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          toast.success(result.message);
          setEditClassDialogOpen(false);
          setSelectedClass(null);
          setEditClass({
            classTypeId: "",
            trainerId: "",
            date: "",
            time: "",
            duration: 60,
            maxParticipants: 20,
            location: "",
          });
          fetchGestionareData(); // Refresh data
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || "Eroare la actualizarea clasei");
        }
      } catch (error) {
        console.error("Eroare la actualizarea clasei:", error);
        toast.error("Eroare la actualizarea clasei");
      } finally {
        setIsSaving(false);
      }
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

  // Delete class function
  const deleteClass = async (clasaId: string) => {
    try {
      const response = await fetch(`/api/admin/gestionare?clasaId=${clasaId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        fetchGestionareData(); // Refresh data
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la ștergerea clasei");
      }
    } catch (error) {
      console.error("Eroare la ștergerea clasei:", error);
      toast.error("Eroare la ștergerea clasei");
    }
  };

  // Calculează statisticile dinamic
  const equipmentStats = gestionareData?.echipamente || [];
  const echipamenteFunctionale = equipmentStats.filter(
    (e) => e.status === "functional"
  ).length;
  const echipamenteDefecte = equipmentStats.filter(
    (e) => e.status === "broken" || e.status === "maintenance"
  ).length;

  const stats = {
    totalClase: gestionareData?.statistici?.totalClase || 0,
    totalParticipanti: gestionareData?.statistici?.totalParticipanti || 0,
    echipamenteFunctionale,
    echipamenteDefecte,
  };

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
                {stats.totalClase}
              </div>
              <div className="text-sm text-muted-foreground">
                Clase programate
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalParticipanti}
              </div>
              <div className="text-sm text-muted-foreground">
                Participanți totali
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.echipamenteFunctionale}
              </div>
              <div className="text-sm text-muted-foreground">
                Echipamente funcționale
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.echipamenteDefecte}
              </div>
              <div className="text-sm text-muted-foreground">
                Necesită atenție
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="schedule">Program săptămânal</TabsTrigger>
            <TabsTrigger value="equipment">
              Echipamente ({gestionareData?.echipamente?.length || 0})
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
                          const classType = cls.classType;
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
                                  {formatTime(cls.time)} -{" "}
                                  {format(
                                    addHours(
                                      new Date(`2000-01-01T${cls.time}`),
                                      cls.duration / 60
                                    ),
                                    "HH:mm"
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
                                    onClick={() => deleteClass(cls.id)}
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
                    placeholder="Caută echipamente după nume..."
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <IconTool className="h-5 w-5" /> Inventar echipamente
                    </CardTitle>
                    <CardDescription>
                      Gestionează și monitorizează statusul echipamentelor din
                      sală
                    </CardDescription>
                  </div>
                  <Button onClick={() => setNewEquipmentDialogOpen(true)}>
                    <IconPlus className="h-4 w-4 mr-1" />
                    Echipament nou
                  </Button>
                </div>
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
                              <div className="p-2 rounded-lg bg-primary/10">
                                <IconBarbell className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold">{item.name}</h3>
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
                                <div className="text-sm text-muted-foreground">
                                  <div>
                                    Data achiziție:{" "}
                                    {new Date(
                                      item.purchaseDate
                                    ).toLocaleDateString("ro-RO")}
                                  </div>
                                  {item.notes && (
                                    <div className="mt-1">{item.notes}</div>
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
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => deleteEquipment(item.id)}
                              >
                                <IconTrash className="h-4 w-4" />
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
                  className={`p-3 rounded-full ${selectedClass.classType.color} bg-opacity-10`}
                >
                  <IconUsers className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {selectedClass.classType.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {format(new Date(selectedClass.date), "d MMMM yyyy", {
                      locale: ro,
                    })}
                    , {selectedClass.time}
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
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setClassDialogOpen(false)}>
              Închide
            </Button>
            <Button
              onClick={() => selectedClass && handleEditClass(selectedClass)}
            >
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
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEquipmentDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button onClick={saveEquipmentChanges} disabled={isSaving}>
              <IconCheck className="h-4 w-4 mr-1" />
              {isSaving ? "Se salvează..." : "Salvează"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Equipment Dialog */}
      <Dialog
        open={newEquipmentDialogOpen}
        onOpenChange={setNewEquipmentDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adaugă echipament nou</DialogTitle>
            <DialogDescription>
              Completează informațiile pentru echipamentul nou
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="denumire">Denumire echipament</Label>
              <Input
                value={newEquipment.denumire}
                onChange={(e) =>
                  setNewEquipment({ ...newEquipment, denumire: e.target.value })
                }
                placeholder="Ex: Bandă de alergare Technogym"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="producator">Producător</Label>
              <Input
                value={newEquipment.producator}
                onChange={(e) =>
                  setNewEquipment({
                    ...newEquipment,
                    producator: e.target.value,
                  })
                }
                placeholder="Ex: Technogym, Matrix, York"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stare">Starea inițială</Label>
              <Select
                value={newEquipment.stare}
                onValueChange={(value) =>
                  setNewEquipment({ ...newEquipment, stare: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selectează starea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Funcțional</SelectItem>
                  <SelectItem value="service">În service</SelectItem>
                  <SelectItem value="defect">Defect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewEquipmentDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              onClick={saveNewEquipment}
              disabled={!newEquipment.denumire || isSaving}
            >
              <IconPlus className="h-4 w-4 mr-1" />
              {isSaving ? "Se adaugă..." : "Adaugă echipament"}
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
                    {gestionareData.tipuriClase.map((type) => (
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
                    {gestionareData.antrenori.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
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
                !newClass.time ||
                isSaving
              }
            >
              <IconPlus className="h-4 w-4 mr-1" />
              {isSaving ? "Se procesează..." : "Programează clasa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editClassDialogOpen} onOpenChange={setEditClassDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editează clasa</DialogTitle>
            <DialogDescription>
              Modifică informațiile clasei existente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editClassType">Tipul clasei</Label>
                <Select
                  value={editClass.classTypeId}
                  onValueChange={(value) =>
                    setEditClass({ ...editClass, classTypeId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tipul clasei" />
                  </SelectTrigger>
                  <SelectContent>
                    {gestionareData.tipuriClase.map((type) => (
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
                <Label htmlFor="editTrainer">Antrenor</Label>
                <Select
                  value={editClass.trainerId}
                  onValueChange={(value) =>
                    setEditClass({ ...editClass, trainerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează antrenorul" />
                  </SelectTrigger>
                  <SelectContent>
                    {gestionareData.antrenori.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name} - {trainer.specialization}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDate">Data</Label>
                <Input
                  type="date"
                  value={editClass.date}
                  onChange={(e) =>
                    setEditClass({ ...editClass, date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editTime">Ora</Label>
                <Input
                  type="time"
                  value={editClass.time}
                  onChange={(e) =>
                    setEditClass({ ...editClass, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="editDuration">Durata (min)</Label>
                <Input
                  type="number"
                  value={editClass.duration}
                  onChange={(e) =>
                    setEditClass({
                      ...editClass,
                      duration: parseInt(e.target.value),
                    })
                  }
                  min="30"
                  max="120"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editMaxParticipants">Max participanți</Label>
                <Input
                  type="number"
                  value={editClass.maxParticipants}
                  onChange={(e) =>
                    setEditClass({
                      ...editClass,
                      maxParticipants: parseInt(e.target.value),
                    })
                  }
                  min="5"
                  max="50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editLocation">Locația</Label>
                <Input
                  value={editClass.location}
                  onChange={(e) =>
                    setEditClass({ ...editClass, location: e.target.value })
                  }
                  placeholder="Ex: Sala 1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditClassDialogOpen(false)}
            >
              Anulează
            </Button>
            <Button
              onClick={saveEditedClass}
              disabled={
                !editClass.classTypeId ||
                !editClass.trainerId ||
                !editClass.date ||
                !editClass.time ||
                isSaving
              }
            >
              <IconCheck className="h-4 w-4 mr-1" />
              {isSaving ? "Se salvează..." : "Salvează modificările"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
