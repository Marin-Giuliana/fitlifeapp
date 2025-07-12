"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconUser } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const profileFormSchema = z.object({
  nume: z.string().min(2, {
    message: "Numele trebuie să conțină cel puțin 2 caractere.",
  }),
  email: z.string().email({
    message: "Adresa de email trebuie să fie validă.",
  }),
  dataNasterii: z.string().optional(),
  sex: z.string().optional(),
});

const passwordFormSchema = z
  .object({
    parolaVeche: z.string().min(1, {
      message: "Parola veche este obligatorie.",
    }),
    parolaNoua: z.string().min(8, {
      message: "Parola nouă trebuie să conțină cel puțin 8 caractere.",
    }),
    confirmaParola: z.string().min(8, {
      message: "Confirmarea parolei este obligatorie.",
    }),
  })
  .refine((data) => data.parolaNoua === data.confirmaParola, {
    message: "Parolele nu coincid.",
    path: ["confirmaParola"],
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  type AbonamentData = {
    tipAbonament: string;
    dataSfarsit: string;
  };

  const [abonamentData, setAbonamentData] = useState<AbonamentData | null>(
    null
  );
  const { data: session } = useSession();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      nume: "",
      email: "",
      dataNasterii: "",
      sex: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      parolaVeche: "",
      parolaNoua: "",
      confirmaParola: "",
    },
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/users/profil");
        if (response.ok) {
          const data = await response.json();
          form.reset({
            nume: data.nume || "",
            email: data.email || "",
            dataNasterii: data.dataNasterii
              ? data.dataNasterii.split("T")[0]
              : "",
            sex: data.sex || "",
          });
          setAbonamentData(data.abonament);
        }
      } catch (error) {
        console.error("Eroare la încărcarea datelor:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchProfileData();
    }
  }, [session, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsLoading(true);
      const response = await fetch("/api/users/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profilul a fost actualizat cu succes!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la actualizarea profilului");
      }
    } catch (error) {
      console.error("Eroare:", error);
      toast.error("A apărut o eroare neașteptată");
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    try {
      setIsChangingPassword(true);
      const response = await fetch("/api/users/schimba-parola", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          parolaVeche: data.parolaVeche,
          parolaNoua: data.parolaNoua,
        }),
      });

      if (response.ok) {
        toast.success("Parola a fost schimbată cu succes!");
        passwordForm.reset();
        setIsPasswordDialogOpen(false);
      } else {
        const error = await response.json();
        toast.error(error.error || "Eroare la schimbarea parolei");
      }
    } catch (error) {
      console.error("Eroare:", error);
      toast.error("A apărut o eroare neașteptată");
    } finally {
      setIsChangingPassword(false);
    }
  }

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col space-y-6">
        <h1 className="text-3xl font-bold">Contul meu</h1>

        <Tabs defaultValue="profil" className="w-full">
          <TabsList>
            <TabsTrigger value="profil">Profil personal</TabsTrigger>
            <TabsTrigger value="securitate">Securitate</TabsTrigger>
          </TabsList>

          <TabsContent value="profil" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconUser className="h-5 w-5" /> Profilul meu
                </CardTitle>
                <CardDescription>
                  Gestionează informațiile tale personale
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-primary">
                      <AvatarFallback className="text-3xl font-bold">
                        {getInitials(form.getValues("nume"))}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Form section */}
                  <div className="flex-1">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="nume"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nume complet</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Numele tău complet"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input
                                    type="email"
                                    placeholder="email@example.com"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="dataNasterii"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data nașterii</FormLabel>
                                <FormControl>
                                  <DatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="sex"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sex</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selectează genul" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="masculin">
                                      Masculin
                                    </SelectItem>
                                    <SelectItem value="feminin">
                                      Feminin
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full md:w-auto"
                          disabled={isLoading}
                        >
                          {isLoading
                            ? "Se salvează..."
                            : "Salvează modificările"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informații despre abonament</CardTitle>
                <CardDescription>
                  Verifică detaliile abonamentului tău
                </CardDescription>
              </CardHeader>
              <CardContent>
                {abonamentData ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-green-800">
                          Abonament {abonamentData.tipAbonament}
                        </p>
                        <p className="text-sm text-green-600">
                          Valabil până pe{" "}
                          {new Date(
                            abonamentData.dataSfarsit
                          ).toLocaleDateString("ro-RO")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Activ
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="font-medium">Nu ai niciun abonament activ</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Vizitează secțiunea Abonamentul meu pentru a achiziționa
                      un abonament
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/membru/abonamentul-meu">
                    Vezi opțiunile de abonament
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="securitate" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Securitate</CardTitle>
                <CardDescription>
                  Gestionează parola și securitatea contului tău
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Schimbă parola</h3>
                      <p className="text-sm text-muted-foreground">
                        Actualizează parola pentru un plus de securitate
                      </p>
                    </div>
                    <Dialog
                      open={isPasswordDialogOpen}
                      onOpenChange={setIsPasswordDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">Modifică</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Schimbă parola</DialogTitle>
                          <DialogDescription>
                            Introdu parola actuală și noua parolă pentru a o
                            schimba.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...passwordForm}>
                          <form
                            onSubmit={passwordForm.handleSubmit(
                              onPasswordSubmit
                            )}
                            className="space-y-4"
                          >
                            <FormField
                              control={passwordForm.control}
                              name="parolaVeche"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Parola actuală</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Introdu parola actuală"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="parolaNoua"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Parola nouă</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Introdu parola nouă"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={passwordForm.control}
                              name="confirmaParola"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirmă parola nouă</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Confirmă parola nouă"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsPasswordDialogOpen(false)}
                              >
                                Anulează
                              </Button>
                              <Button
                                type="submit"
                                disabled={isChangingPassword}
                              >
                                {isChangingPassword
                                  ? "Se schimbă..."
                                  : "Schimbă parola"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
