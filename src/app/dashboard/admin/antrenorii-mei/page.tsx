"use client";

import { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconEdit,
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

const trainersData = [
  {
    id: 1,
    nume: "Maria Ionescu",
    email: "maria.ionescu@fitlife.com",
    dataNasterii: "1985-03-20",
    sex: "feminin",
    rol: "antrenor",
    antrenor: {
      dataAngajarii: "2020-01-15",
      specializari: ["Yoga", "Pilates", "Personal Training"],
    },
  },
  {
    id: 2,
    nume: "Alexandru Popescu",
    email: "alex.popescu@fitlife.com",
    dataNasterii: "1988-07-12",
    sex: "masculin",
    rol: "antrenor",
    antrenor: {
      dataAngajarii: "2019-03-20",
      specializari: ["CrossFit", "HIIT", "Fitness"],
    },
  },
  {
    id: 3,
    nume: "Andreea Mihai",
    email: "andreea.mihai@fitlife.com",
    dataNasterii: "1992-11-08",
    sex: "feminin",
    rol: "antrenor",
    antrenor: {
      dataAngajarii: "2021-06-10",
      specializari: ["Zumba", "Aerobic", "Stretching"],
    },
  },
  {
    id: 4,
    nume: "Daniel Radu",
    email: "daniel.radu@fitlife.com",
    dataNasterii: "1990-02-14",
    sex: "masculin",
    rol: "antrenor",
    antrenor: {
      dataAngajarii: "2022-09-05",
      specializari: ["Spinning", "Aqua Aerobic"],
    },
  },
];

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTrainers = trainersData.filter((trainer) => {
    const matchesSearch = trainer.nume
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ro-RO");
  };

  const calculateExperience = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();

    if (months < 0) {
      return `${years - 1} ani ${12 + months} luni`;
    }
    return `${years} ani ${months} luni`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Antrenorii mei</h1>
          <p className="text-muted-foreground mt-2">
            Gestionează echipa de antrenori din FitLife Club
          </p>
        </div>
        <Button className="flex items-center gap-2">
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
              {trainersData.length}
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
              Femei / Bărbați
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {trainersData.filter((t) => t.sex === "feminin").length} /{" "}
              {trainersData.filter((t) => t.sex === "masculin").length}
            </div>
            <p className="text-sm text-muted-foreground">Distribuția pe gen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-purple-600" />
              Experiență medie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {(
                trainersData.reduce((sum, trainer) => {
                  const startYear = new Date(
                    trainer.antrenor.dataAngajarii
                  ).getFullYear();
                  const currentYear = new Date().getFullYear();
                  return sum + (currentYear - startYear);
                }, 0) / trainersData.length
              ).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Ani experiență</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtre și căutare */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume..."
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
                <TableHead>Email</TableHead>
                <TableHead>Experiență</TableHead>
                <TableHead>Specializări</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainers.map((trainer) => (
                <TableRow key={trainer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback>
                          {getInitials(trainer.nume)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{trainer.nume}</div>
                        <div className="text-sm text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800 text-xs"
                          >
                            {trainer.rol}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <IconMail className="h-3 w-3" />
                      {trainer.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {calculateExperience(trainer.antrenor.dataAngajarii)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        din {formatDate(trainer.antrenor.dataAngajarii)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {trainer.antrenor.specializari.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {trainer.antrenor.specializari.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{trainer.antrenor.specializari.length - 2}
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
                        <DropdownMenuItem>
                          <IconEye className="h-4 w-4 mr-2" />
                          Vezi detalii
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <IconEdit className="h-4 w-4 mr-2" />
                          Editează
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <IconTrash className="h-4 w-4 mr-2" />
                          Șterge
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
    </div>
  );
}
