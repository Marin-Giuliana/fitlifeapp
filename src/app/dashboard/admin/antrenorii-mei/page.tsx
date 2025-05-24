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
  IconAward,
  IconMail,
  IconPhone,
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
    telefon: "0722 987 654",
    dataAngajarii: "2020-01-15",
    specializari: ["Yoga", "Pilates", "Personal Training"],
    membriActivi: 47,
    clasePredate: 156,
    rating: 4.9,
    status: "activ",
  },
  {
    id: 2,
    nume: "Alexandru Popescu",
    email: "alex.popescu@fitlife.com",
    telefon: "0722 123 456",
    dataAngajarii: "2019-03-20",
    specializari: ["CrossFit", "HIIT", "Fitness"],
    membriActivi: 32,
    clasePredate: 203,
    rating: 4.7,
    status: "activ",
  },
  {
    id: 3,
    nume: "Andreea Mihai",
    email: "andreea.mihai@fitlife.com",
    telefon: "0722 456 789",
    dataAngajarii: "2021-06-10",
    specializari: ["Zumba", "Aerobic", "Stretching"],
    membriActivi: 38,
    clasePredate: 89,
    rating: 4.8,
    status: "activ",
  },
  {
    id: 4,
    nume: "Daniel Radu",
    email: "daniel.radu@fitlife.com",
    telefon: "0722 789 123",
    dataAngajarii: "2022-09-05",
    specializari: ["Spinning", "Aqua Aerobic"],
    membriActivi: 25,
    clasePredate: 45,
    rating: 4.6,
    status: "inactiv",
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              {trainersData.filter((t) => t.status === "activ").length} activi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconBriefcase className="h-5 w-5 text-green-600" />
              Membri îndrumați
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {trainersData.reduce(
                (sum, trainer) => sum + trainer.membriActivi,
                0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total membri activi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-purple-600" />
              Clase predate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {trainersData.reduce(
                (sum, trainer) => sum + trainer.clasePredate,
                0
              )}
            </div>
            <p className="text-sm text-muted-foreground">Total clase</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconAward className="h-5 w-5 text-orange-600" />
              Rating mediu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {(
                trainersData.reduce((sum, trainer) => sum + trainer.rating, 0) /
                trainersData.length
              ).toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground">Din 5 stele</p>
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
                <TableHead>Contact</TableHead>
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
                          {trainer.clasePredate} clase predate
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <IconMail className="h-3 w-3" />
                        {trainer.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <IconPhone className="h-3 w-3" />
                        {trainer.telefon}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {calculateExperience(trainer.dataAngajarii)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        din {formatDate(trainer.dataAngajarii)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {trainer.specializari.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {trainer.specializari.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{trainer.specializari.length - 2}
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
