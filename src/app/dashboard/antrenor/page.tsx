"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IconUsers,
  IconCalendar,
  IconActivity,
  IconChartBar,
  IconBriefcase,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

type DashboardData = {
  antrenor: {
    nume: string;
    email: string;
    specializari: string[];
  };
  statistici: {
    membriActivi: number;
    claseAstazi: number;
    claseSaptamana: number;
    sesiuniProgramate: number;
    totalClasePredate: number;
    totalPlanuriCreate: number;
    ratingMediu: number;
  };
  activitatiZilei: Array<{
    id: string;
    tip: "grupa" | "privata";
    nume: string;
    ora: string;
    participanti?: number;
    maxParticipanti?: number;
    client?: string;
    status: string;
  }>;
  resumeRapid: {
    claseAstazi: number;
    claseSaptamana: number;
    sesiuniProgramate: number;
  };
};

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalizata":
        return "bg-green-500";
      case "confirmata":
      case "programata":
        return "bg-blue-500";
      default:
        return "bg-orange-500";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session) return;

      try {
        setIsLoading(true);
        const response = await fetch("/api/antrenor/dashboard");

        if (!response.ok) {
          throw new Error("Eroare la încărcarea datelor");
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Eroare la încărcarea dashboard-ului:", err);
        setError(err instanceof Error ? err.message : "Eroare necunoscută");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [session]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-red-600">
          Eroare la încărcarea datelor: {error || "Date indisponibile"}
        </div>
      </div>
    );
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bun venit, {dashboardData.antrenor.nume}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Gata să inspiri și să transformi vieți astăzi?
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarFallback className="text-xl font-bold">
              {getInitials(dashboardData.antrenor.nume)}
            </AvatarFallback>
          </Avatar>
          <div className="flex gap-1 mt-2 flex-wrap justify-center">
            {dashboardData.antrenor.specializari.map((spec) => (
              <Badge key={spec} variant="outline">
                {spec}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/antrenor/orarul-meu">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconCalendar className="h-6 w-6 text-primary" /> Orarul meu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Vizualizează și gestionează clasele tale programate, modifică
                disponibilitatea
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Astăzi:</span>
                  <span className="font-medium">
                    {dashboardData.resumeRapid.claseAstazi} clase
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Săptămâna aceasta:</span>
                  <span className="font-medium">
                    {dashboardData.resumeRapid.claseSaptamana} clase
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/antrenor/orarul-meu">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconUsers className="h-6 w-6 text-primary" /> Membrii mei
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Gestionează sesiunile private
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Membri activi:</span>
                  <span className="font-medium">
                    {dashboardData.statistici.membriActivi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sesiuni programate:</span>
                  <span className="font-medium">
                    {dashboardData.statistici.sesiuniProgramate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/antrenor/planuri">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconBriefcase className="h-6 w-6 text-primary" /> Planuri
                antrenament
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Creează și gestionează planurile de antrenament pentru membrii
                tăi
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                <div className="flex justify-between">
                  <span>Planuri create:</span>
                  <span className="font-medium">
                    {dashboardData.statistici.totalPlanuriCreate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconActivity className="h-5 w-5" /> Activitatea zilei
              </CardTitle>
              <CardDescription>
                Clasele și sesiunile tale de astăzi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardData.activitatiZilei.length > 0 ? (
                dashboardData.activitatiZilei.map((activitate) => (
                  <div
                    key={activitate.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${getStatusColor(
                          activitate.status
                        )}`}
                      ></div>
                      <div>
                        <p className="font-medium">{activitate.nume}</p>
                        <p className="text-sm text-muted-foreground">
                          {activitate.ora}
                        </p>
                      </div>
                    </div>
                    {activitate.tip === "grupa" ? (
                      <Badge variant="secondary">
                        {activitate.participanti} participanți
                      </Badge>
                    ) : (
                      <Badge variant="outline">Privat</Badge>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  Nu ai activități programate pentru astăzi
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChartBar className="h-5 w-5" /> Statistici
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-primary">
                  {dashboardData.statistici.membriActivi}
                </span>
                <p className="text-sm text-muted-foreground">Membri activi</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-primary">
                  {dashboardData.statistici.totalClasePredate}
                </span>
                <p className="text-sm text-muted-foreground">Clase predate</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
