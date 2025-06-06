"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IconBarbell,
  IconCarambola,
  IconUsers,
  IconCalendar,
  IconActivity,
  IconTicket,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { QRCodeCard } from "@/components/qr-code-card";

interface DashboardData {
  utilizator: {
    nume: string;
    email: string;
    dataInregistrare?: string;
  };
  abonament: {
    tipAbonament: string;
    dataInceput: string;
    dataSfarsit: string;
    status: string;
    zileleRamase: number;
    progres: number;
  } | null;
  sedintePT: {
    disponibile: number;
  };
  statistici: {
    totalClase: number;
    participariClase: number;
    progresAbonament: number;
  };
}

export default function Page() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/membru/dashboard');
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Eroare la încărcarea datelor dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchDashboardData();
    }
  }, [session]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Se încarcă...</div>
        </div>
      </div>
    );
  }

  const getInitials = (nume: string) => {
    return nume.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Bun venit, {dashboardData?.utilizator.nume || 'Membru FitLife'}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Îți urăm o zi plină de energie și fitness!
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src="/avatar-placeholder.png" alt="Membru" />
            <AvatarFallback className="text-xl font-bold">
              {dashboardData?.utilizator.nume ? getInitials(dashboardData.utilizator.nume) : 'MF'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <div className="flex justify-center">
          <QRCodeCard />
        </div>

        <Link href="/dashboard/membru/abonamentul-meu">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
            <CardContent className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-xl">
                  <IconCarambola className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Abonamentul meu</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestiune abonament
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {dashboardData?.abonament ? (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-2xl font-bold text-green-800 mb-1">
                      {dashboardData.abonament.tipAbonament}
                    </div>
                    <p className="text-sm text-green-600 mb-2">
                      Activ până pe {new Date(dashboardData.abonament.dataSfarsit).toLocaleDateString('ro-RO')}
                    </p>
                    <div className="text-xs text-green-600">
                      {dashboardData.abonament.zileleRamase} zile rămase
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-muted-foreground mb-1">
                      Nu este activ
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Activează un abonament pentru a avea acces la toate
                      facilitățile
                    </p>
                  </div>
                )}
              </div>

              {/* Action hint */}
              <div className="mt-auto pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Click pentru detalii →
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/membru/clase-de-grup">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
            <CardContent className="flex flex-col h-full">
              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-xl">
                  <IconBarbell className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Clase de grup</h3>
                  <p className="text-sm text-muted-foreground">
                    Antrenamente în grup
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold text-primary mb-1">
                      {dashboardData?.statistici.totalClase || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Total clase</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold text-primary mb-1">
                      {dashboardData?.statistici.participariClase || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Participări</p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <p className="text-sm text-muted-foreground">
                    Înscrie-te la clasele disponibile
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Explorează clasele →
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/membru/personal-trainer">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col">
            <CardContent className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-primary/10 rounded-xl">
                  <IconUsers className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Personal Trainer</h3>
                  <p className="text-sm text-muted-foreground">
                    Antrenament personalizat
                  </p>
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardData?.sedintePT.disponibile || 0}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Ședințe disponibile
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData?.sedintePT.disponibile ? 
                      'Programează o ședință cu antrenorul tău' : 
                      'Cumpără un pachet de ședințe PT'
                    }
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Rezervă ședință →
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" /> Progresul tău
          </CardTitle>
          <CardDescription>
            Un rezumat al activității tale recente
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold text-primary">
              {dashboardData?.statistici.participariClase || 0}
            </span>
            <span className="text-sm text-muted-foreground">
              Clase frecventate
            </span>
            <div className="flex items-center mt-2">
              <IconBarbell className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Activitate</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold text-primary">
              {dashboardData?.sedintePT.disponibile || 0}
            </span>
            <span className="text-sm text-muted-foreground">
              Ședințe PT disponibile
            </span>
            <div className="flex items-center mt-2">
              <IconTicket className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Beneficii</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold text-primary">
              {dashboardData?.statistici.progresAbonament || 0}%
            </span>
            <span className="text-sm text-muted-foreground">
              Progres abonament
            </span>
            <div className="flex items-center mt-2">
              <IconCalendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {dashboardData?.abonament ? 
                  `${dashboardData.abonament.zileleRamase} zile rămase` : 
                  'Fără abonament activ'
                }
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Continuă să monitorizezi progresul tău și să te bucuri de
            facilitățile FitLife
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
