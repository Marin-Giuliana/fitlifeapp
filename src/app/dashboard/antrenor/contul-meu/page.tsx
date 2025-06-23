"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconUser, IconBriefcase, IconAward } from "@tabler/icons-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  dataAngajarii: z.string().optional(),
  specializari: z
    .array(z.string())
    .min(0, { message: "Selectează cel puțin o specializare." }),
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

const availableSpecializations = [
  "Pilates",
  "Yoga",
  "Spinning",
  "Zumba",
  "Crossfit",
  "Body Pump",
];

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  type ProfileData = {
    nume: string;
    email: string;
    dataNasterii?: string;
    sex?: string;
    dataAngajarii?: string;
    specializari?: string[];
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
      dataAngajarii: "",
      specializari: [],
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
        const response = await fetch("/api/antrenori/profil");
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
            dataAngajarii: data.dataAngajarii
              ? data.dataAngajarii.split("T")[0]
              : "",
            specializari: data.specializari || [],
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
      const response = await fetch("/api/antrenori/profil", {
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

  const calculateExperience = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const years = now.getFullYear() - start.getFullYear();
    const months = now.getMonth() - start.getMonth();

    if (months < 0) {
      return `${years - 1} ani ${12 + months} luni`;
    }
    return `${years} ani ${months} luni`;
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
            <TabsTrigger value="specializari">Specializări</TabsTrigger>
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

                          <FormField
                            control={form.control}
                            name="dataAngajarii"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data angajării</FormLabel>
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
                  <IconBriefcase className="h-5 w-5" />
                  Informații antrenor
                </CardTitle>
                <CardDescription>
                  Detalii despre activitatea ta ca antrenor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Rol</h4>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      Antrenor
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
                    <h4 className="font-medium mb-2">Experiență</h4>
                    <p className="text-sm text-muted-foreground">
                      {profileData?.dataAngajarii
                        ? calculateExperience(profileData.dataAngajarii)
                        : "0 ani"}
                    </p>
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

          <TabsContent value="specializari" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconAward className="h-5 w-5" />
                  Specializările mele
                </CardTitle>
                <CardDescription>
                  Gestionează tipurile de clase pe care le poți preda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">Specializări active</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {profileData?.specializari?.map((spec: string) => (
                        <Badge key={spec} variant="outline">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">
                      Selectează specializările tale
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableSpecializations.map((item) => (
                        <div
                          key={item}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={item}
                            checked={form.watch("specializari")?.includes(item)}
                            onCheckedChange={(checked) => {
                              const currentSpecs =
                                form.getValues("specializari") || [];
                              if (checked) {
                                form.setValue("specializari", [
                                  ...currentSpecs,
                                  item,
                                ]);
                              } else {
                                form.setValue(
                                  "specializari",
                                  currentSpecs.filter((value) => value !== item)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={item}
                            className="font-normal text-sm cursor-pointer"
                          >
                            {item}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      const data = form.getValues();
                      onSubmit(data);
                    }}
                  >
                    {isLoading
                      ? "Se actualizează..."
                      : "Actualizează specializările"}
                  </Button>
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
