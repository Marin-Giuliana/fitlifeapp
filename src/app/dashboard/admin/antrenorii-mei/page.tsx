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
  IconBriefcase,
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
interface Antrenor {
  id: string;
  nume: string;
  email: string;
  telefon: string;
  dataNasterii: Date;
  sex: string;
  dataInregistrare: Date;
  specializari: string[];
  experienta: string;
  certificari: string[];
  status: string;
  rating: number;
  numarClienti: number;
}

interface AntrenoriData {
  antrenori: Antrenor[];
  membri: {
    id: string;
    nume: string;
    email: string;
  }[];
  statistici: {
    totalAntrenori: number;
    antrenoriActivi: number;
    antrenoriInactivi: number;
    ratingMediu: number;
  };
}

export default function Page() {
  const { data: session } = useSession();
  const [antrenoriData, setAntrenoriData] = useState<AntrenoriData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAntrenor, setSelectedAntrenor] = useState<Antrenor | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"view" | "delete" | "add">(
    "view"
  );
  const [selectedMembru, setSelectedMembru] = useState<string>("");

  const fetchAntrenoriData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/antrenori");

      if (response.ok) {
        const data = await response.json();
        setAntrenoriData(data);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la încărcarea antrenorilor");
      }
    } catch (error) {
      console.error("Eroare la încărcarea antrenorilor:", error);
      toast.error("Eroare la încărcarea antrenorilor");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAntrenoriData();
    }
  }, [session, fetchAntrenoriData]);

  const filteredAntrenori =
    antrenoriData?.antrenori.filter((antrenor) => {
      const matchesSearch =
        antrenor.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        antrenor.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // const formatDate = (dateString: Date) => {
  //   return new Date(dateString).toLocaleDateString("ro-RO");
  // };

  const handleAction = (antrenor: Antrenor, action: "view" | "delete") => {
    setSelectedAntrenor(antrenor);
    setActionType(action);
    setDialogOpen(true);
  };

  const handleAddAntrenor = () => {
    setActionType("add");
    setSelectedMembru("");
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAntrenor) return;

    try {
      const response = await fetch("/api/admin/antrenori", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "demote",
          antrenorId: selectedAntrenor.id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message);
        setDialogOpen(false);
        fetchAntrenoriData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Eroare la retrogradarea antrenorului");
      }
    } catch (error) {
      console.error("Eroare la retrogradarea antrenorului:", error);
      toast.error("Eroare la retrogradarea antrenorului");
    }
  };

  const handlePromote = async () => {
    if (!selectedMembru) return;

    try {
      const response = await fetch("/api/admin/antrenori", {
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
        fetchAntrenoriData();
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!antrenoriData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele antrenorilor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Antrenorii mei</h1>
          <p className="text-muted-foreground mt-2">
            Gestionează echipa de antrenori din FitLife Club
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleAddAntrenor}>
          <IconPlus className="h-4 w-4" />
          Adaugă antrenor
        </Button>
      </div>

      {/* Statistici rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUsers className="h-5 w-5 text-blue-600" />
              Total Antrenori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {antrenoriData.statistici.totalAntrenori}
            </div>
            <p className="text-sm text-muted-foreground">
              Utilizatori cu rol antrenor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconBriefcase className="h-5 w-5 text-green-600" />
              Antrenori Activi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {antrenoriData.statistici.antrenoriActivi}
            </div>
            <p className="text-sm text-muted-foreground">
              Din {antrenoriData.statistici.totalAntrenori} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-red-600" />
              Antrenori Inactivi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {antrenoriData.statistici.antrenoriInactivi}
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

      {/* Tabelul cu antrenori */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Antrenor</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Specializări</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAntrenori.map((antrenor) => (
                <TableRow key={antrenor.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback>
                          {getInitials(antrenor.nume)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{antrenor.nume}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <IconMail className="h-3 w-3" />
                      {antrenor.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${getStatusColor(antrenor.status)} text-xs`}
                    >
                      {antrenor.status === "activ" ? "Activ" : "Inactiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {antrenor.specializari.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {antrenor.specializari.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{antrenor.specializari.length - 2}
                        </Badge>
                      )}
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
                          onClick={() => handleAction(antrenor, "view")}
                        >
                          <IconEye className="h-4 w-4 mr-2" />
                          Vezi detalii
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleAction(antrenor, "delete")}
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
              {actionType === "view" && "Detalii Antrenor"}
              {actionType === "delete" && "Confirmă Retrogradarea"}
              {actionType === "add" && "Promovează Membru la Antrenor"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "view" && "Informații complete despre antrenor"}
              {actionType === "delete" &&
                "Ești sigur că vrei să retrogrezi acest antrenor la membru?"}
              {actionType === "add" &&
                "Selectează un membru din listă pentru a-l promova la antrenor"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {actionType === "add" && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Selectează membru:
                  </label>
                  <Select
                    value={selectedMembru}
                    onValueChange={setSelectedMembru}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Alege un membru din listă" />
                    </SelectTrigger>
                    <SelectContent>
                      {antrenoriData?.membri.map((membru) => (
                        <SelectItem key={membru.id} value={membru.id}>
                          {membru.nume} - {membru.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedAntrenor && (
              <>
                {actionType === "view" && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback className="text-lg">
                          {getInitials(selectedAntrenor.nume)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">
                          {selectedAntrenor.nume}
                        </h3>
                        <p className="text-muted-foreground">
                          {selectedAntrenor.email}
                        </p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium">Specializări:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedAntrenor.specializari.map((spec) => (
                          <Badge key={spec} variant="outline">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {actionType === "delete" && (
                  <div className="text-center">
                    <p>
                      Antrenorul <strong>{selectedAntrenor.nume}</strong> va fi
                      retrogradat la membru.
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
