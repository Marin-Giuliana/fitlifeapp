"use client";

import { useState } from "react";
import {
  IconPlus,
  IconSearch,
  IconEdit,
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

// Mock data pentru administratori - bazat pe User model
const administratorsData = [
  {
    id: 1,
    nume: "George Popescu",
    email: "george.popescu@fitlife.com",
    dataNasterii: "1985-03-15",
    sex: "masculin",
    rol: "admin",
  },
  {
    id: 2,
    nume: "Elena Mihai",
    email: "elena.mihai@fitlife.com",
    dataNasterii: "1990-07-22",
    sex: "feminin",
    rol: "admin",
  },
  {
    id: 3,
    nume: "Cristian Radu",
    email: "cristian.radu@fitlife.com",
    dataNasterii: "1988-11-03",
    sex: "masculin",
    rol: "admin",
  },
];

export default function Page() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAdministrators = administratorsData.filter((admin) => {
    const matchesSearch = admin.nume
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Administratori</h1>
          <p className="text-muted-foreground mt-2">
            Gestionează echipa de administratori din FitLife Club
          </p>
        </div>
        <Button className="flex items-center gap-2">
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
              {administratorsData.length}
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
              Femei / Bărbați
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {administratorsData.filter((a) => a.sex === "feminin").length} /{" "}
              {administratorsData.filter((a) => a.sex === "masculin").length}
            </div>
            <p className="text-sm text-muted-foreground">Distribuția pe gen</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-purple-600" />
              Vârsta medie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(
                administratorsData.reduce((sum, admin) => {
                  const birthYear = new Date(admin.dataNasterii).getFullYear();
                  const age = new Date().getFullYear() - birthYear;
                  return sum + age;
                }, 0) / administratorsData.length
              )}
            </div>
            <p className="text-sm text-muted-foreground">Ani vârstă</p>
          </CardContent>
        </Card>
      </div>

      {/* Căutare */}
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

      {/* Tabelul cu administratori */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data nașterii</TableHead>
                <TableHead>Sex</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdministrators.map((admin) => (
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
                        <div className="text-sm text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800 text-xs"
                          >
                            {admin.rol}
                          </Badge>
                        </div>
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
                    <div className="font-medium">
                      {formatDate(admin.dataNasterii)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date().getFullYear() -
                        new Date(admin.dataNasterii).getFullYear()}{" "}
                      ani
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        admin.sex === "feminin"
                          ? "bg-pink-50 text-pink-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {admin.sex === "feminin" ? "Feminin" : "Masculin"}
                    </Badge>
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
