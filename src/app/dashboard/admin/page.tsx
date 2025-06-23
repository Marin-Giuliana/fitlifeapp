"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import {
  IconUsers,
  IconChartBar,
  IconShieldCog,
  IconTrendingUp,
  IconMoodHappy,
  IconCoin,
  IconBriefcase,
  IconCalendar,
  IconBarbell,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface DashboardData {
  admin: {
    nume: string;
    email: string;
    initials: string;
  };
  statistici: {
    totalMembri: number;
    antrenoriActivi: number;
    totalAdmini: number;
    totalClase: number;
    totalSesiuniPrivate: number;
    totalEchipamente: number;
    echipamenteFunctionale: number;
    echipamenteDefecte: number;
    ocupareMedie: number;
    crestereMembriFeminin: number;
    crescereMembriMasculin: number;
    procentajFemei: number;
    procentajBarbati: number;
    venitLunar: number;
    abonamenteStandard: number;
    abonamenteStandardPlus: number;
    abonamentePremium: number;
  };
  claseRecente: Array<{
    id: string;
    tipClasa: string;
    dataClasa: string;
    oraClasa: string;
    antrenor: string;
    participanti: number;
    nrLocuri: number;
  }>;
}

export default function Page() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/admin/dashboard");
        if (response.ok) {
          const data = await response.json();
          console.log("Dashboard data received:", data); // Debug
          setDashboardData(data);
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
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!dashboardData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <p className="text-muted-foreground">
            Nu s-au putut încărca datele dashboard-ului.
          </p>
        </div>
      </div>
    );
  }

  const { admin, statistici } = dashboardData;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrator</h1>
          <p className="text-muted-foreground mt-2">
            Monitorizează performanța și activitatea FitLife Club
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src="/avatar-placeholder.png" alt="Admin" />
            <AvatarFallback className="text-xl font-bold">
              {admin.initials}
            </AvatarFallback>
          </Avatar>
          <Badge variant="secondary" className="mt-2 bg-red-100 text-red-800">
            Administrator
          </Badge>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconUsers className="h-5 w-5 text-blue-600" />
              Total Membri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {statistici.totalMembri}
            </div>
            <p className="text-sm text-muted-foreground">
              Total membri înregistrați
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
              {statistici.antrenoriActivi}
            </div>
            <p className="text-sm text-muted-foreground">
              Antrenori activi în sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCoin className="h-5 w-5 text-orange-600" />
              Venituri Luna
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {statistici.venitLunar.toLocaleString()} RON
            </div>
            <p className="text-sm text-muted-foreground">
              Venituri din abonamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconCalendar className="h-5 w-5 text-purple-600" />
              Total Clase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {statistici.totalClase}
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">{statistici.ocupareMedie}%</span>{" "}
              ocupare medie
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/dashboard/admin/administratori">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconShieldCog className="h-6 w-6 text-primary" />
                Gestionare Administratori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Adaugă, modifică sau elimină administratori din sistem
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/admin/antrenorii-mei">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconUsers className="h-6 w-6 text-primary" />
                Gestionare Antrenori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitorizează și gestionează echipa de antrenori
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Demografia Membrilor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5" />
              Demografia Membrilor
            </CardTitle>
            <CardDescription>Distribuția membrilor pe gen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Distribuția pe gen */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Distribuția pe gen</span>
                <span className="text-sm text-muted-foreground">
                  {statistici.totalMembri} membri
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {statistici.procentajFemei}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Femei ({statistici.crestereMembriFeminin})
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {statistici.procentajBarbati}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Bărbați ({statistici.crescereMembriMasculin})
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tipuri de abonament */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCoin className="h-5 w-5" />
              Tipuri de Abonament
            </CardTitle>
            <CardDescription>Abonamente active și venituri</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-700">
                {statistici.venitLunar.toLocaleString()} RON
              </div>
              <div className="text-sm text-muted-foreground">
                Venituri luna curentă
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Standard (150 RON)</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      Math.round(
                        (statistici.abonamenteStandard /
                          (statistici.abonamenteStandard +
                            statistici.abonamenteStandardPlus +
                            statistici.abonamentePremium)) *
                          100
                      ) || 0
                    }
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {statistici.abonamenteStandard}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Standard+ (250 RON)</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      Math.round(
                        (statistici.abonamenteStandardPlus /
                          (statistici.abonamenteStandard +
                            statistici.abonamenteStandardPlus +
                            statistici.abonamentePremium)) *
                          100
                      ) || 0
                    }
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {statistici.abonamenteStandardPlus}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Premium (400 RON)</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      Math.round(
                        (statistici.abonamentePremium /
                          (statistici.abonamenteStandard +
                            statistici.abonamenteStandardPlus +
                            statistici.abonamentePremium)) *
                          100
                      ) || 0
                    }
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {statistici.abonamentePremium}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Echipamente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBarbell className="h-5 w-5" />
              Starea Echipamentelor
            </CardTitle>
            <CardDescription>Monitorizarea inventarului</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-700">
                {statistici.totalEchipamente}
              </div>
              <div className="text-sm text-muted-foreground">
                Total echipamente
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600">Funcționale</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      Math.round(
                        (statistici.echipamenteFunctionale /
                          statistici.totalEchipamente) *
                          100
                      ) || 0
                    }
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {statistici.echipamenteFunctionale}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-red-600">Necesită atenție</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={
                      Math.round(
                        (statistici.echipamenteDefecte /
                          statistici.totalEchipamente) *
                          100
                      ) || 0
                    }
                    className="w-20 h-2"
                  />
                  <span className="text-sm font-medium">
                    {statistici.echipamenteDefecte}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">
                Stare generală
              </div>
              <div className="text-lg font-bold">
                {Math.round(
                  (statistici.echipamenteFunctionale /
                    statistici.totalEchipamente) *
                    100
                ) || 0}
                %
              </div>
              <div className="text-xs text-green-600">
                echipamente operaționale
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performanțe Lunare */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Performanțe Lunare
            </CardTitle>
            <CardDescription>Indicatori cheie de performanță</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {statistici.ocupareMedie}%
              </div>
              <div className="text-sm text-muted-foreground">
                Ocupare medie clase
              </div>
              <div className="flex items-center justify-center mt-1">
                <IconMoodHappy className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {statistici.antrenoriActivi}
              </div>
              <div className="text-sm text-muted-foreground">
                Antrenori activi
              </div>
              <div className="flex items-center justify-center mt-1">
                <IconTrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {statistici.totalClase}
              </div>
              <div className="text-sm text-muted-foreground">
                Clase programate
              </div>
              <div className="flex items-center justify-center mt-1">
                <IconCalendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {statistici.totalSesiuniPrivate}
              </div>
              <div className="text-sm text-muted-foreground">
                Ședințe private
              </div>
              <div className="flex items-center justify-center mt-1">
                <IconMoodHappy className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
