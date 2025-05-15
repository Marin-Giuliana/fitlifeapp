"use client";

import { Button } from "@/components/ui/button";
import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import { useState } from "react";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut({ callbackUrl: "/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`px-2 mt-auto ${className}`}>
      <Button
        variant="outline"
        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={isLoading}
        onClick={handleLogout}
      >
        <IconLogout className="mr-2" />
        Log out
      </Button>
    </div>
  );
}
