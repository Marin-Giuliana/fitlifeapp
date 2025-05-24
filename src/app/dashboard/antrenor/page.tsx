"use client";

import Link from "next/link";
import {
  IconUsers,
  IconCalendar,
  IconActivity,
  IconChartBar,
  IconClock,
  IconBriefcase,
  IconPlus,
  IconUser,
  IconAward,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Bun venit, Antrenor Maria!</h1>
          <p className="text-muted-foreground mt-2">
            Gata să inspiri și să transformi vieți astăzi?
          </p>
        </div>
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 border-4 border-primary">
            <AvatarImage src="/avatar-placeholder.png" alt="Antrenor" />
            <AvatarFallback className="text-xl font-bold">MI</AvatarFallback>
          </Avatar>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline">Yoga</Badge>
            <Badge variant="outline">Pilates</Badge>
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
                  <span className="font-medium">3 clase</span>
                </div>
                <div className="flex justify-between">
                  <span>Săptămâna aceasta:</span>
                  <span className="font-medium">12 clase</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-3">
              <IconUsers className="h-6 w-6 text-primary" /> Membrii mei
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-2">
              Gestionează clienții de personal training și sesiunile private
            </CardDescription>

            <div className="mt-4 p-2 bg-muted rounded-md text-sm">
              <div className="flex justify-between mb-1">
                <span>Membri activi:</span>
                <span className="font-medium">47</span>
              </div>
              <div className="flex justify-between">
                <span>Sesiuni programate:</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>

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
                  <span className="font-medium">23</span>
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
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Yoga Matinal</p>
                    <p className="text-sm text-muted-foreground">
                      08:00 - 09:00
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">12 participanți</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Pilates Intermediar</p>
                    <p className="text-sm text-muted-foreground">
                      10:30 - 11:30
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">8 participanți</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">Personal Training - Ana M.</p>
                    <p className="text-sm text-muted-foreground">
                      16:00 - 17:00
                    </p>
                  </div>
                </div>
                <Badge variant="outline">Privat</Badge>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <IconPlus className="h-4 w-4 mr-2" />
                Adaugă activitate
              </Button>
            </CardFooter>
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
                <span className="text-3xl font-bold text-primary">47</span>
                <p className="text-sm text-muted-foreground">Membri activi</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-primary">156</span>
                <p className="text-sm text-muted-foreground">Clase predate</p>
              </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <span className="text-3xl font-bold text-primary">4.9</span>
                <p className="text-sm text-muted-foreground">Rating mediu</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
