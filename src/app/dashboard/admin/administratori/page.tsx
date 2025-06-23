"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  IconPlus,
  IconSearch,
  IconTrash,
  IconEye,
  IconUsers,
  IconShieldCog,
  IconCalendar,
  IconMail,
  IconDots,
} from "@tabler/icons-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Interface definitions
interface Administrator {
  id: string;
  nume: string;
  email: string;
  telefon: string;
  dataNasterii: Date;
  sex: string;
  dataInregistrare: Date;
  permisiuni: string[];
  ultimaActivitate: Date;
  status: string;
  rol: string;
  departament: string;
}

interface AdministratoriData {
  administratori: Administrator[];
  membri: {
    id: string;
    nume: string;
    email: string;
    rol: string;
  }[];
  statistici: {
    totalAdministratori: number;
    administratoriActivi: number;
    administratoriInactivi: number;
    ultimaLuna: number;
  };
}

export default function Page() {
  const { data: session } = useSession();
  const [administratoriData, setAdministratoriData] =
    useState<AdministratoriData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"view" | "delete" | "add">(
    "view"
  );
  const [selectedMembru, setSelectedMembru] = useState<string>("");

  const fetchAdministratoriData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/administratori");

      if (response.ok) {
        const data = await response.json();
        setAdministratoriData(data);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Eroare la încărcarea administratorilor"
        );
      }
    } catch (error) {
      console.error("Eroare la încărcarea administratorilor:", error);
      toast.error("Eroare la încărcarea administratorilor");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAdministratoriData();
    }
  }, [session, fetchAdministratoriData]);

  const filteredAdministratori =
    administratoriData?.administratori.filter((admin) => {
      const matchesSearch =
        admin.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleAction = (admin: Administrator, action: "view" | "delete") => {
    setSelectedAdmin(admin);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleAddAdmin = () => {
    setActionType("add");
    setSelectedMembru("");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    try {
      const response = await fetch("/api/admin/administratori", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "demote",
          adminId: selectedAdmin.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setDialogOpen(false);
        fetchAdministratoriData();
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Eroare la retrogradarea administratorului"
        );
      }
    } catch (error) {
      console.error("Eroare la retrogradarea administratorului:", error);
      toast.error("Eroare la retrogradarea administratorului");
    }
  };

  const handlePromote = async () => {
    if (!selectedMembru) return;

    try {
      const response = await fetch("/api/admin/administratori", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "promote",
          membruId: selectedMembru,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setDialogOpen(false);
        fetchAdministratoriData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la promovarea membrului");
      }
    } catch (error) {
      console.error("Eroare la promovarea membrului:", error);
      toast.error("Eroare la promovarea membrului");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "activ":
        return "bg-green-100 text-green-800";
      case "inactiv":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRolColor = (rol: string) => {
    switch (rol) {
      case "super-admin":
        return "bg-purple-100 text-purple-800";
      case "administrator":
        return "bg-blue-100 text-blue-800";
      case "manager":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!administratoriData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele administratorilor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administratori</h1>
          <p className="text-muted-foreground mt-2">
            Gestionează echipa de administratori din FitLife Club
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleAddAdmin}>
          <IconPlus className="h-4 w-4" />
          Adaugă administrator
        </Button>
      </div>

      {/* Statistici rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUsers className="h-5 w-5 text-blue-600" />
              Total Administratori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {administratoriData.statistici.totalAdministratori}
            </div>
            <p className="text-sm text-muted-foreground">
              Utilizatori cu rol admin
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconShieldCog className="h-5 w-5 text-green-600" />
              Administratori Activi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {administratoriData.statistici.administratoriActivi}
            </div>
            <p className="text-sm text-muted-foreground">
              Din {administratoriData.statistici.totalAdministratori} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-red-600" />
              Administratori Inactivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {administratoriData.statistici.administratoriInactivi}
            </div>
            <p className="text-sm text-muted-foreground">Dezactivați</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtre și căutare */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume sau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabelul cu administratori */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Rol & Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdministratori.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback>
                          {getInitials(admin.nume)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{admin.nume}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <IconMail className="h-3 w-3" />
                      {admin.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Badge
                        variant="secondary"
                        className={`${getRolColor(admin.rol)} text-xs`}
                      >
                        {admin.rol}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${getStatusColor(
                          admin.status
                        )} text-xs block w-fit`}
                      >
                        {admin.status === "activ" ? "Activ" : "Inactiv"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAction(admin, "view")}
                        >
                          <IconEye className="h-4 w-4 mr-2" />
                          Vezi detalii
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleAction(admin, "delete")}
                        >
                          <IconTrash className="h-4 w-4 mr-2" />
                          Retrogradează la membru
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog pentru acțiuni */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "view" && "Detalii Administrator"}
              {actionType === "delete" && "Confirmă Retrogradarea"}
              {actionType === "add" && "Promovează Utilizator la Administrator"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "view" &&
                "Informații complete despre administrator"}
              {actionType === "delete" &&
                "Ești sigur că vrei să retrogrezi acest administrator la membru?"}
              {actionType === "add" &&
                "Selectează un membru sau antrenor din listă pentru a-l promova la administrator"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionType === "add" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Selectează utilizator:
                  </label>
                  <Select
                    value={selectedMembru}
                    onValueChange={setSelectedMembru}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Alege un utilizator din listă" />
                    </SelectTrigger>
                    <SelectContent>
                      {administratoriData?.membri.map((membru) => (
                        <SelectItem key={membru.id} value={membru.id}>
                          {membru.nume} - {membru.email} (
                          {membru.rol === "membru" ? "Membru" : "Antrenor"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedAdmin && (
              <>
                {actionType === "view" && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback className="text-lg">
                          {getInitials(selectedAdmin.nume)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selectedAdmin.nume}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedAdmin.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {actionType === "delete" && (
                  <div className="text-center">
                    <p>
                      Administratorul <strong>{selectedAdmin.nume}</strong> va
                      fi retrogradat la membru.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Această acțiune va schimba rolul utilizatorului în membru.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {actionType === "delete"
                ? "Anulează"
                : actionType === "add"
                ? "Anulează"
                : "Închide"}
            </Button>
            {actionType === "delete" && (
              <Button variant="destructive" onClick={handleDelete}>
                Retrogradează
              </Button>
            )}
            {actionType === "add" && (
              <Button onClick={handlePromote} disabled={!selectedMembru}>
                Promovează
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
