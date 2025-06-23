"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconUser, IconShieldCog } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
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
    parolaNoua: z.string().min(6, {
      message: "Parola nouă trebuie să conțină cel puțin 6 caractere.",
    }),
    confirmaParola: z.string().min(6, {
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
  type ProfileData = {
    nume: string;
    email: string;
    dataNasterii?: string;
    sex?: string;
    // Add other fields as needed
  };

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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
        const response = await fetch("/api/admin/profil");
        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          form.reset({
            nume: data.nume || "",
            email: data.email || "",
            dataNasterii: data.dataNasterii
              ? data.dataNasterii.split("T")[0]
              : "",
            sex: data.sex || "",
          });
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
      const response = await fetch("/api/admin/profil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Profilul a fost actualizat cu succes!");
        const result = await response.json();
        setProfileData(result.user);
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
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
                <CardTitle className="flex items-center gap-2">
                  <IconShieldCog className="h-5 w-5" />
                  Informații admin
                </CardTitle>
                <CardDescription>
                  Detalii despre contul tău de administrator
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Rol</h4>
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      Administrator
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Vârsta</h4>
                    <p className="text-sm text-muted-foreground">
                      {profileData?.dataNasterii
                        ? calculateAge(profileData.dataNasterii)
                        : 0}{" "}
                      ani
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Status cont</h4>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700"
                    >
                      Activ
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sex</h4>
                    <Badge
                      variant="outline"
                      className={
                        profileData?.sex === "feminin"
                          ? "bg-pink-50 text-pink-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {profileData?.sex === "feminin" ? "Feminin" : "Masculin"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
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
                            Introdu parola actuală şi noua parolă pentru a o
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
