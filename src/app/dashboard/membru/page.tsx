"use client";

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

export default function Page() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bun venit, Membru FitLife!</h1>
          <p className="text-muted-foreground mt-2">
            Îți urăm o zi plină de energie și fitness!
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src="/avatar-placeholder.png" alt="Membru" />
            <AvatarFallback className="text-xl font-bold">MF</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link href="/dashboard/membru/abonamentul-meu">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconCarambola className="h-6 w-6 text-primary" /> Abonamentul
                meu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Verifică detaliile abonamentului tău curent, istoricul și
                opțiunile de reînnoire
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm text-center">
                Nu ai un abonament activ
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/membru/clase-de-grup">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconBarbell className="h-6 w-6 text-primary" /> Clase de grup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Descoperă și înscrie-te la clasele de grup disponibile,
                verifică-ți participările
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                <div className="flex justify-between mb-1">
                  <span>Total clase:</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Participări:</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/membru/personal-trainer">
          <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-3">
                <IconUsers className="h-6 w-6 text-primary" /> Personal Trainer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-2">
                Programează ședințe cu antrenorul tău personal, vezi istoricul
                antrenamentelor
              </CardDescription>

              <div className="mt-4 p-2 bg-muted rounded-md text-sm">
                <div className="flex justify-between">
                  <span>Ședințe disponibile:</span>
                  <span className="font-medium">0</span>
                </div>
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
            <span className="text-3xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">
              Clase frecventate
            </span>
            <div className="flex items-center mt-2">
              <IconBarbell className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Activitate</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">
              Ședințe PT disponibile
            </span>
            <div className="flex items-center mt-2">
              <IconTicket className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Beneficii</span>
            </div>
          </div>

          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <span className="text-3xl font-bold text-primary">0%</span>
            <span className="text-sm text-muted-foreground">
              Progres abonament
            </span>
            <div className="flex items-center mt-2">
              <IconCalendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Fără abonament activ
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
