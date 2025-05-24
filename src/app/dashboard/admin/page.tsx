"use client";

import Link from "next/link";
import {
  IconUsers,
  IconChartBar,
  IconShieldCog,
  IconTrendingUp,
  IconClockHour4,
  IconMoodHappy,
  IconCoin,
  IconBriefcase,
  IconCalendar,
  IconActivity,
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

export default function Page() {
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
            <AvatarFallback className="text-xl font-bold">AD</AvatarFallback>
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
            <div className="text-3xl font-bold text-blue-600">347</div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">+12</span> această lună
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
            <div className="text-3xl font-bold text-green-600">8</div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">+1</span> nou angajat
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
            <div className="text-3xl font-bold text-orange-600">47,250</div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">+8.5%</span> vs luna trecută
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IconBarbell className="h-5 w-5 text-purple-600" />
              Clase Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">23</div>
            <p className="text-sm text-muted-foreground">
              <span className="text-green-600">94%</span> ocupare medie
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChartBar className="h-5 w-5" />
              Demografia Membrilor
            </CardTitle>
            <CardDescription>
              Distribuția membrilor pe categorii demografice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Distribuția pe gen */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Distribuția pe gen</span>
                <span className="text-sm text-muted-foreground">347 membri</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-pink-50 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">64%</div>
                  <div className="text-sm text-muted-foreground">Femei (222)</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">36%</div>
                  <div className="text-sm text-muted-foreground">Bărbați (125)</div>
                </div>
              </div>
            </div>

            {/* Tipuri de abonament */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium">Tipuri de abonament</span>
                <span className="text-sm text-muted-foreground">Top vânzări</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Standard</span>
                  <div className="flex items-center gap-2">
                    <Progress value={65} className="w-20 h-2" />
                    <span className="text-sm font-medium">65%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Premium</span>
                  <div className="flex items-center gap-2">
                    <Progress value={25} className="w-20 h-2" />
                    <span className="text-sm font-medium">25%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Standard+</span>
                  <div className="flex items-center gap-2">
                    <Progress value={10} className="w-20 h-2" />
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ore de vârf */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClockHour4 className="h-5 w-5" />
              Ore de Vârf
            </CardTitle>
            <CardDescription>
              Momentele cu cea mai mare activitate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-700">18:00 - 20:00</div>
              <div className="text-sm text-muted-foreground">Ora de vârf principală</div>
              <div className="text-xs text-yellow-600 mt-1">85% ocupare medie</div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>07:00 - 09:00</span>
                <span className="font-medium">72%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>12:00 - 14:00</span>
                <span className="font-medium">45%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>20:00 - 22:00</span>
                <span className="font-medium">38%</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Capacitate maximă</div>
              <div className="text-lg font-bold">150 persoane</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activitatea Recentă */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconActivity className="h-5 w-5" />
              Activitate Recentă
            </CardTitle>
            <CardDescription>
              Ultimele acțiuni în sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Nou membru înregistrat</p>
                <p className="text-xs text-muted-foreground">Ana Popescu - Acum 15 min</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Clasă nouă programată</p>
                <p className="text-xs text-muted-foreground">Yoga Avansați - Acum 2 ore</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Abonament reînnoit</p>
                <p className="text-xs text-muted-foreground">Mihai Ionescu - Premium - Acum 3 ore</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Performanțe Lunare
            </CardTitle>
            <CardDescription>
              Indicatori cheie de performanță
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">96%</div>
              <div className="text-sm text-muted-foreground">Satisfacție membri</div>
              <div className="flex items-center justify-center mt-1">
                <IconMoodHappy className="h-4 w-4 text-green-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">87%</div>
              <div className="text-sm text-muted-foreground">Rată de retenție</div>
              <div className="flex items-center justify-center mt-1">
                <IconTrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">142</div>
              <div className="text-sm text-muted-foreground">Clase predate</div>
              <div className="flex items-center justify-center mt-1">
                <IconCalendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-muted-foreground">Rating mediu</div>
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
