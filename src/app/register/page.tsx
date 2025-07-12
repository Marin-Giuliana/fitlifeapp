"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [nume, setNume] = useState("");
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (parola.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nume,
          email,
          parola,
          rol: "membru", // Default role for new users
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Înregistrarea a eșuat");
      }

      // Redirect to login page after successful registration
      router.push("/login?registered=true");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Înregistrarea a eșuat"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Creează un cont</h1>
          <p className="mt-2 text-gray-600">Înregistrează-te pentru a începe</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nume">Nume complet</Label>
              <Input
                id="nume"
                name="nume"
                type="text"
                autoComplete="name"
                required
                value={nume}
                onChange={(e) => setNume(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Adresa de email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="parola">Parola</Label>
              <Input
                id="parola"
                name="parola"
                type="password"
                autoComplete="new-password"
                required
                value={parola}
                onChange={(e) => setParola(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Crearea contului..." : "Creează cont"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Deja ai un cont?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Intră în cont
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
