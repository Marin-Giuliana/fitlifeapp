"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  IconUpload,
  IconUser,
  IconBriefcase,
  IconAward,
} from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const availableSpecializations = [
  "Yoga",
  "Pilates",
  "Zumba",
  "CrossFit",
  "Fitness",
  "Aerobic",
  "Spinning",
  "Aqua Aerobic",
  "Personal Training",
  "Stretching",
  "Functional",
  "HIIT",
];

export default function Page() {
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    nume: "Maria Ionescu",
    email: "maria.ionescu@fitlife.com",
    dataNasterii: "1985-03-20",
    sex: "feminin",
    dataAngajarii: "2020-01-15",
    specializari: ["Yoga", "Pilates", "Personal Training"],
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  function onSubmit(data: ProfileFormValues) {
    console.log(data);
  }

  const handleAvatarChange = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 1500);
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
                      <AvatarImage
                        src="/avatar-placeholder.png"
                        alt="Poza profil"
                      />
                      <AvatarFallback className="text-3xl font-bold">
                        MI
                      </AvatarFallback>
                    </Avatar>

                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={isUploading}
                      onClick={handleAvatarChange}
                    >
                      {isUploading ? (
                        "Se încarcă..."
                      ) : (
                        <>
                          <IconUpload className="h-4 w-4" />
                          Schimbă poza
                        </>
                      )}
                    </Button>
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
                                  defaultValue={field.value}
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

                        <Button type="submit" className="w-full md:w-auto">
                          Salvează modificările
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
                      {defaultValues.dataNasterii
                        ? calculateAge(defaultValues.dataNasterii)
                        : 0}{" "}
                      ani
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Experiență</h4>
                    <p className="text-sm text-muted-foreground">
                      {defaultValues.dataAngajarii
                        ? calculateExperience(defaultValues.dataAngajarii)
                        : "0 ani"}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Sex</h4>
                    <Badge
                      variant="outline"
                      className={
                        defaultValues.sex === "feminin"
                          ? "bg-pink-50 text-pink-700"
                          : "bg-blue-50 text-blue-700"
                      }
                    >
                      {defaultValues.sex === "feminin" ? "Feminin" : "Masculin"}
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
                      {defaultValues.specializari?.map((spec) => (
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
                    onClick={() => {
                      const data = form.getValues();
                      console.log("Specializări:", data.specializari);
                    }}
                  >
                    Actualizează specializările
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
                    <Button variant="outline">Modifică</Button>
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
