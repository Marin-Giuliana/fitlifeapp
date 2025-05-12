"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [parola, setParola] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: parola, // Note: NextAuth still expects 'password' field
      });

      if (result?.error) {
        setError("Email sau parolă invalidă");
        setIsLoading(false);
        return;
      }

      // Redirect to dashboard based on user role
      // This will be enhanced when we implement role-based redirection
      router.push("/dashboard/membru");
      router.refresh();
    } catch (error) {
      setError("A apărut o eroare neașteptată: " + error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Bine ai venit</h1>
          <p className="mt-2 text-gray-600">Autentifică-te în contul tău</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                autoComplete="current-password"
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
              {isLoading ? "Autentificare în curs..." : "Autentifică-te"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Nu ai un cont?{" "}
            <Link
              href="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Înregistrează-te
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
