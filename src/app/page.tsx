"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  IconBarbell,
  IconUsers,
  IconTrophy,
  IconMapPin,
  IconCheck,
  IconPlayerPlay,
  IconMenu2,
  IconMoon,
  IconSun,
  IconStar,
  IconCertificate,
} from "@tabler/icons-react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { getDashboardUrl } from "@/lib/roleRedirect";

export default function LandingPage() {
  const { setTheme, theme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getDashboardLink = () => {
    if (session?.user?.role) {
      return getDashboardUrl(session.user.role);
    }
    return "/login";
  };

  const getDashboardButtonText = () => {
    if (session?.user) {
      return "Intră în cont";
    }
    return "Intră în cont!";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo.png" height={50} width={50} alt="logo" />
              <span className="text-2xl font-bold whitespace-nowrap">
                FitLife Club
              </span>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="#"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Acasă
              </Link>
              <Link
                href="#despre"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Despre noi
              </Link>
              <Link
                href="#abonamente"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Abonamente
              </Link>
              <Link
                href="#antrenori"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Antrenorii noștri
              </Link>
              <Link
                href="#clase"
                className="text-foreground/70 hover:text-primary transition-colors"
              >
                Clase de grup
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {mounted && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                  className="h-8 w-8 px-0"
                >
                  <IconSun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <IconMoon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              <Button asChild className="hidden md:inline-flex" size="lg">
                <Link href={getDashboardLink()}>
                  {getDashboardButtonText()}
                </Link>
              </Button>
              <Button className="md:hidden" variant="ghost" size="icon">
                <IconMenu2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Exercițiile sunt cheia unui{" "}
                <span className="text-primary">stil de viață sănătos</span>!
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                De câte ori ți-ai spus că o să începi de mâine să faci
                exerciții? Sau de luni?
                <br />
                Sau de săptămâna viitoare? Sau poate chiar de luna următoare..
                Povestea
                <br />
                ta poate prinde contur alături de noi..
                <strong> începând chiar de astăzi!</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link href="/register">
                    Înscrie-te acum în clubul FitLife!
                  </Link>
                </Button>
                <a href="https://youtu.be/4-zjQvTDnbw?si=radfkhcnELeekEHm">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                  >
                    <IconPlayerPlay className="mr-2 h-5 w-5" />
                    Urmărește video
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center">
                    <IconBarbell className="h-24 w-24 text-primary/50" />
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -right-4 bg-background border rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-2">
                    <IconMapPin className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">
                        Găsește cea mai
                      </div>
                      <div className="font-semibold text-sm text-foreground">
                        apropiată sală
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-primary text-white rounded-xl p-4 shadow-lg">
                  <IconTrophy className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="despre" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Beneficiile <span className="text-primary">Exercițiilor</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Descoperă cum exercițiile regulate pot transforma nu doar corpul
              tău,
              <br />
              ci și starea ta de spirit și calitatea vieții
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <IconUsers className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">
                  Stil de viață sănătos
                </h4>
                <p className="text-muted-foreground">
                  Dezvoltă obiceiuri sănătoase care te vor ajuta să te simți mai
                  energic și mai puternic în fiecare zi.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <IconBarbell className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">
                  Flexibilitate și meditație
                </h4>
                <p className="text-muted-foreground">
                  Îmbunătățește-ți flexibilitatea și găsește echilibrul mental
                  prin exerciții de yoga și meditație.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <IconTrophy className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-3">
                  Învinge oboseala constantă
                </h4>
                <p className="text-muted-foreground">
                  Crește-ți nivelul de energie și combate oboseala prin
                  antrenamente regulate și eficiente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Image */}
      <section className="py-20 bg-gradient-to-br from-muted/50 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="w-full h-96 bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl flex items-center justify-center">
                <IconUsers className="h-32 w-32 text-primary/50" />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl font-bold">
                Gata pentru o <span className="text-primary">schimbare?</span>
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Nu mai amâna! Fiecare zi care trece fără să îți îngrijești
                corpul și mintea este o zi pierdută. Alătură-te comunității
                FitLife Club și începe transformarea de astăzi. Antrenorii
                noștri te vor ghida pas cu pas către o versiune mai bună a ta.
              </p>
              <Button size="lg" className="text-lg px-8 py-6">
                <Link href="/register">Începe acum!</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="abonamente" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Alege <span className="text-primary">tipul de abonament</span>{" "}
              care ți se potrivește
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Oferim planuri flexibile care se adaptează stilului tău de viață
              și obiectivelor tale de fitness.
              <br />
              Fiecare abonament vine cu garanția calității și a rezultatelor
              dorite.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Standard Plan */}
            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow h-full flex flex-col">
              <div className="p-8 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Standard</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">150</span>
                    <span className="text-xl text-muted-foreground ml-1">
                      RON
                    </span>
                    <span className="text-muted-foreground/70 ml-1">/lună</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Acces 24/7",
                    "Echipamente variate și moderne",
                    "Antrenamente nelimitate",
                    "Evaluare corporală inclusă",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full mt-auto" variant="outline" asChild>
                  <Link href="/dashboard/membru/abonamentul-meu">
                    Achiziționează acum!
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Standard+ Plan - Featured */}
            <Card className="relative overflow-hidden border-2 border-primary shadow-xl scale-105 h-full flex flex-col">
              <div className="absolute top-0 left-0 right-0 bg-primary text-white text-center py-2 text-sm font-semibold">
                Cel mai popular
              </div>
              <div className="p-8 pt-12 flex-1 flex flex-col">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Standard+</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">250</span>
                    <span className="text-xl text-muted-foreground ml-1">
                      RON
                    </span>
                    <span className="text-muted-foreground/70 ml-1">/lună</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {[
                    "Acces 24/7",
                    "Echipamente variate și moderne",
                    "Antrenamente nelimitate",
                    "Evaluare corporală inclusă",
                    "Acces nelimitat la clase de grup",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full mt-auto" asChild>
                  <Link href="/dashboard/membru/abonamentul-meu">
                    Achiziționează acum!
                  </Link>
                </Button>
              </div>
            </Card>

            {/* Premium Plan */}
            <Card className="relative overflow-hidden border-2 hover:shadow-lg transition-shadow">
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-2">Premium</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold">400</span>
                    <span className="text-xl text-muted-foreground ml-1">
                      RON
                    </span>
                    <span className="text-muted-foreground/70 ml-1">/lună</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {[
                    "Acces 24/7",
                    "Echipamente variate și moderne",
                    "Antrenamente nelimitate",
                    "Evaluare corporală inclusă",
                    "Acces nelimitat la clase de grup",
                    "Ședințe private cu antrenori personali",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <IconCheck className="h-5 w-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/membru/abonamentul-meu">
                    Achiziționează acum!
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Trainers Section */}
      <section
        id="antrenori"
        className="py-20 bg-gradient-to-br from-muted/50 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Antrenorii <span className="text-primary">noștri</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Echipa noastră de antrenori certificați și experimentați este gata
              să te ghideze către obiectivele tale de fitness
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Trainer 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconUsers className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Maria Popescu</h3>
                <p className="text-primary font-medium mb-2">
                  Antrenor Personal & Yoga
                </p>
                <div className="flex justify-center items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    5.0
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Specializată în yoga și pilates cu peste 8 ani de experiență.
                  Certificată internațional în Hatha și Vinyasa Yoga.
                </p>
                <div className="flex justify-center items-center">
                  <IconCertificate className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs text-muted-foreground">
                    Certificat RYT-500
                  </span>
                </div>
              </div>
            </Card>

            {/* Trainer 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconBarbell className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Alexandru Ionescu</h3>
                <p className="text-primary font-medium mb-2">
                  Antrenor Strength & Conditioning
                </p>
                <div className="flex justify-center items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    4.9
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Expert în antrenamentul cu greutăți și CrossFit. Fost atlet de
                  performanță cu 10+ ani în pregătirea fizică profesională.
                </p>
                <div className="flex justify-center items-center">
                  <IconCertificate className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs text-muted-foreground">
                    Certificat NASM-CPT
                  </span>
                </div>
              </div>
            </Card>

            {/* Trainer 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <IconTrophy className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Elena Dumitrescu</h3>
                <p className="text-primary font-medium mb-2">
                  Antrenor Cardio & Zumba
                </p>
                <div className="flex justify-center items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <IconStar
                      key={i}
                      className="h-4 w-4 text-yellow-500 fill-current"
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    4.8
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Pasionată de dans și fitness, specializată în Zumba și
                  antrenamente cardio. Instructor certificat cu energia și
                  motivația de care ai nevoie.
                </p>
                <div className="flex justify-center items-center">
                  <IconCertificate className="h-4 w-4 text-primary mr-1" />
                  <span className="text-xs text-muted-foreground">
                    Certificat ZIN & ACSM
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Group Classes Section */}
      <section id="clase" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Clase de <span className="text-primary">grup</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Alătură-te claselor noastre de grup pentru o experiență de fitness
              motivantă și socializare într-un mediu prietenos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Class 1 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-pink-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Pilates</h3>
                  <div className="w-12 h-12 bg-pink-500/10 rounded-full flex items-center justify-center">
                    <IconUsers className="h-6 w-6 text-pink-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Îmbunătățește-ți flexibilitatea, forța core-ului și postura
                  prin exerciții controlled și precise.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Maria Popescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Lun, Mie, Vin - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>60 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Începător - Intermediar</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Class 2 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-purple-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Yoga</h3>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
                    <IconUsers className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Găsește echilibrul perfect între corp și minte prin pozițiile
                  tradiționale de yoga.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Maria Popescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Mar, Joi - 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>75 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Toate nivelele</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Class 3 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-blue-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Spinning</h3>
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <IconBarbell className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Antrenament cardio intens pe bicicletă staționară cu muzică
                  motivantă și energie maximă.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Elena Dumitrescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Lun, Mie, Vin - 17:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>45 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Intermediar - Avansat</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Class 4 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-yellow-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Zumba</h3>
                  <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <IconUsers className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Dans și fitness într-o combinație perfectă! Arde calorii
                  distrându-te pe ritmuri latino.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Elena Dumitrescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Mar, Joi, Sâm - 18:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>50 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Toate nivelele</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Class 5 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-red-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">CrossFit</h3>
                  <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center">
                    <IconBarbell className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Antrenament funcțional de înaltă intensitate care combină
                  cardio, forță și agilitate.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Alexandru Ionescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Lun, Mie, Vin - 19:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>60 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Intermediar - Avansat</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Class 6 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-2 bg-green-500"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">Body Pump</h3>
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <IconBarbell className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Antrenament cu greutăți ușoare pe muzică energizantă pentru
                  tonifierea întregului corp.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span>Alexandru Ionescu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Program:</span>
                    <span>Mar, Joi, Sâm - 17:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Durată:</span>
                    <span>55 minute</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nivel:</span>
                    <span>Începător - Intermediar</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-6">
              Toate clasele includ echipamentele necesare și sunt conduse de
              instructori certificați
            </p>
            <Button size="lg" asChild>
              <Link href="/register">Înscrie-te la clase de grup</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Începe transformarea ta astăzi
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Nu mai amâna! Fă primul pas către o viață mai sănătoasă și mai
              activă. Înscrie-te acum și beneficiază de prima săptămână
              gratuită.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link href="/register">Înscrie-te acum gratuit</Link>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
                asChild
              >
                <Link href={getDashboardLink()}>
                  {session?.user ? "Intră în cont" : "Ai deja cont?"}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <IconBarbell className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  FitLife Club
                </span>
              </div>
              <p className="text-muted-foreground/70">
                Transformă-ți viața cu cel mai modern club de fitness din oraș.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Servicii</h3>
              <ul className="space-y-2 text-muted-foreground/70">
                <li>Clase de grup</li>
                <li>Personal training</li>
                <li>Consultanță nutrițională</li>
                <li>Evaluări fitness</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Program</h3>
              <ul className="space-y-2 text-muted-foreground/70">
                <li>Luni - Vineri: 06:00 - 23:00</li>
                <li>Sâmbătă: 08:00 - 22:00</li>
                <li>Duminică: 09:00 - 21:00</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-foreground">Contact</h3>
              <ul className="space-y-2 text-muted-foreground/70">
                <li className="flex items-center">
                  <IconMapPin className="h-4 w-4 mr-2" />
                  Str. Fitness 123, București
                </li>
                <li>Tel: 0721 123 456</li>
                <li>Email: contact@fitlifeclub.ro</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground/70">
            © 2025 FitLife Club. Toate drepturile rezervate.
          </div>
        </div>
      </footer>
    </div>
  );
}
