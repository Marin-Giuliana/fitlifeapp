"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IconUpload, IconUser } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profileFormSchema = z.object({
  nume: z.string().min(2, {
    message: "Numele trebuie să conțină cel puțin 2 caractere.",
  }),
  email: z.string().email({
    message: "Adresa de email trebuie să fie validă.",
  }),
  dataNasterii: z.string().optional(),
  sex: z.string().optional(),
  telefon: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function Page() {
  // const [avatarUrl, setAvatarUrl] = useState("/avatar-placeholder.png");
  const [isUploading, setIsUploading] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    nume: "Alexandru Popescu",
    email: "alex.popescu@example.com",
    dataNasterii: "1990-05-15",
    sex: "masculin",
    telefon: "0722 123 456",
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
                      <AvatarImage
                        src="/avatar-placeholder.png"
                        alt="Poza profil"
                      />
                      <AvatarFallback className="text-3xl font-bold">
                        AP
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
                                  <Input type="date" {...field} />
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
                            name="telefon"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefon</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Număr de telefon"
                                    {...field}
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
                <CardTitle>Informații despre abonament</CardTitle>
                <CardDescription>
                  Verifică detaliile abonamentului tău
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="font-medium">Nu ai niciun abonament activ</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vizitează secțiunea Abonamentul meu pentru a achiziționa un
                    abonament
                  </p>
                </div>
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
                    <Button variant="outline">Modifică</Button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Sesiuni active</h3>
                      <p className="text-sm text-muted-foreground">
                        Gestionează dispozitivele conectate la contul tău
                      </p>
                    </div>
                    <Button variant="outline">Vizualizează</Button>
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
