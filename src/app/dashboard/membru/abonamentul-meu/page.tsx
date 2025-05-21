"use client";

import { useState } from "react";
import {
  IconCheck,
  IconX,
  IconCreditCard,
  IconBarbell,
  IconHeart,
  IconClock,
  IconUser,
  IconUserPlus,
  IconPlus,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function Page() {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [showPTDialog, setShowPTDialog] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState("");
  const [selectedPTPackage, setSelectedPTPackage] = useState(0);

  const openSubscriptionDialog = (type: string) => {
    setSelectedSubscription(type);
    setShowSubscriptionDialog(true);
  };

  const openPTDialog = (count: number) => {
    setSelectedPTPackage(count);
    setShowPTDialog(true);
  };

  const SubscriptionDialog = () => (
    <Dialog
      open={showSubscriptionDialog}
      onOpenChange={setShowSubscriptionDialog}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconCreditCard className="h-5 w-5 text-primary" />
            Achiziționează abonament {selectedSubscription}
          </DialogTitle>
          <DialogDescription>
            Confirmă achiziționarea abonamentului pentru următoarea lună
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Detalii abonament</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tip abonament:</span>
                <span className="font-medium">{selectedSubscription}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Perioadă:</span>
                <span className="font-medium">1 lună</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț:</span>
                <span className="font-medium">
                  {selectedSubscription === "Standard"
                    ? "150 lei"
                    : selectedSubscription === "Standard+"
                    ? "250 lei"
                    : selectedSubscription === "Premium"
                    ? "400 lei"
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Abonamentul va fi activat imediat și va fi valabil pentru
              următoarele 30 de zile.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anulează</Button>
          </DialogClose>
          <Button onClick={() => setShowSubscriptionDialog(false)}>
            Confirmă achiziția
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const PTSessionsDialog = () => (
    <Dialog open={showPTDialog} onOpenChange={setShowPTDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUserPlus className="h-5 w-5 text-primary" />
            Achiziționează ședințe PT
          </DialogTitle>
          <DialogDescription>
            Confirmă achiziționarea pachetului de ședințe cu antrenor personal
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4 p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Detalii pachet</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Număr ședințe:</span>
                <span className="font-medium">{selectedPTPackage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț per ședință:</span>
                <span className="font-medium">
                  {selectedPTPackage === 1
                    ? "100 lei"
                    : selectedPTPackage === 4
                    ? "95 lei"
                    : selectedPTPackage === 8
                    ? "90 lei"
                    : ""}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Preț total:</span>
                <span className="font-medium">
                  {selectedPTPackage === 1
                    ? "100 lei"
                    : selectedPTPackage === 4
                    ? "380 lei"
                    : selectedPTPackage === 8
                    ? "720 lei"
                    : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Ședințele vor fi adăugate imediat la contul tău și pot fi
              utilizate oricând.
            </p>
            <p className="mt-2">
              Programările se fac în secțiunea &quot;Personal Trainer&quot; din
              contul tău.
            </p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anulează</Button>
          </DialogClose>
          <Button onClick={() => setShowPTDialog(false)}>
            Confirmă achiziția
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Abonamentul meu</h1>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Abonament curent</h2>

        <Card>
          <CardHeader>
            <CardTitle>Nu ai un abonament activ</CardTitle>
            <CardDescription>
              Alege unul dintre abonamentele de mai jos pentru a continua
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => openSubscriptionDialog("Standard")}>
              <IconPlus className="h-4 w-4 mr-2" /> Achiziționează un abonament
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Tipuri de abonamente</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-muted"></div>
            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>Acces de bază la sală</CardDescription>
              <div className="mt-2">
                <span className="text-2xl font-bold">150 lei</span>
                <span className="text-muted-foreground text-sm"> / lună</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconBarbell className="h-4 w-4" /> Acces la echipamente
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="h-4 w-4" /> Program 24/7
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-red-500">
                    <IconX className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUser className="h-4 w-4" /> Acces la clase de grup
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-red-500">
                    <IconX className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconHeart className="h-4 w-4" /> Plan alimentar/exerciții
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openSubscriptionDialog("Standard")}
              >
                Alege Standard
              </Button>
            </CardFooter>
          </Card>

          <Card className="relative overflow-hidden border-secondary">
            <div className="absolute top-0 left-0 right-0 h-2 bg-secondary"></div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Standard+</CardTitle>
                  <CardDescription>Acces extins și clase</CardDescription>
                </div>
                <Badge variant="secondary">Popular</Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">250 lei</span>
                <span className="text-muted-foreground text-sm"> / lună</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconBarbell className="h-4 w-4" /> Acces la echipamente
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="h-4 w-4" /> Program 24/7
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUser className="h-4 w-4" /> Acces la clase de grup
                    nelimitat
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconHeart className="h-4 w-4" /> Plan alimentar/exerciții
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => openSubscriptionDialog("Standard+")}
              >
                Alege Standard+
              </Button>
            </CardFooter>
          </Card>

          <Card className="relative overflow-hidden border-primary">
            <div className="absolute top-0 left-0 right-0 h-2 bg-primary"></div>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Premium</CardTitle>
                  <CardDescription>Experiență completă</CardDescription>
                </div>
                <Badge variant="default">Premium</Badge>
              </div>
              <div className="mt-2">
                <span className="text-2xl font-bold">400 lei</span>
                <span className="text-muted-foreground text-sm"> / lună</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconBarbell className="h-4 w-4" /> Acces la echipamente
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconClock className="h-4 w-4" /> Program 24/7
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconUser className="h-4 w-4" /> Acces la clase de grup
                    nelimitat
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-green-500">
                    <IconCheck className="h-4 w-4" />
                  </span>
                  <span className="flex items-center gap-1">
                    <IconHeart className="h-4 w-4" /> Plan alimentar/exerciții
                  </span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => openSubscriptionDialog("Premium")}
              >
                Alege Premium
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Ședințe cu antrenor personal
        </h2>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUserPlus className="h-5 w-5 text-primary" /> Ședințe extra cu
              antrenor personal
            </CardTitle>
            <CardDescription>
              Achiziționează ședințe suplimentare în afara abonamentului tău
              curent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="p-4 bg-muted rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Ședințe disponibile</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-primary">0</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ședințe rămase
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Sedințele cu antrenor personal îți oferă ghidare
                  personalizată, suport și motivație pentru a-ți atinge
                  obiectivele de fitness mai rapid și mai eficient.
                </p>

                <p className="text-sm font-medium">Beneficii:</p>
                <ul className="text-sm space-y-1 mt-2">
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />{" "}
                    Antrenamente personalizate
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" /> Ajustarea
                    tehnicii de execuție
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" /> Maximizarea
                    rezultatelor
                  </li>
                  <li className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" /> Feedback
                    constant
                  </li>
                </ul>
              </div>

              <div className="flex-1">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-4">
                    Achiziționează ședințe suplimentare
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            1
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">1 ședință</p>
                          <p className="text-sm text-muted-foreground">
                            O singură ședință PT
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">100 lei</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => openPTDialog(1)}
                        >
                          Alege
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            4
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">4 ședințe</p>
                          <p className="text-sm text-muted-foreground">
                            Pachet săptămânal
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">380 lei</p>
                        <p className="text-xs text-green-500">
                          Economisești 20 lei
                        </p>
                        <Button
                          size="sm"
                          className="mt-1"
                          onClick={() => openPTDialog(4)}
                        >
                          Alege
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex gap-3 items-center">
                        <Avatar className="h-10 w-10 bg-primary/10">
                          <AvatarFallback className="text-primary">
                            8
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">8 ședințe</p>
                          <p className="text-sm text-muted-foreground">
                            Pachet lunar
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">720 lei</p>
                        <p className="text-xs text-green-500">
                          Economisești 80 lei
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1"
                          onClick={() => openPTDialog(8)}
                        >
                          Alege
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialoguri */}
      <SubscriptionDialog />
      <PTSessionsDialog />
    </div>
  );
}
