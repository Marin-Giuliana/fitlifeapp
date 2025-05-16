"use client";

import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IconShieldCog,
  // IconUserCircle,
  IconBriefcase,
} from "@tabler/icons-react";

export function UserNav() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />;
  }

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const currentRole = session?.user?.role;
  const hasAdminAccess = currentRole === "admin";
  const hasTrainerAccess =
    currentRole === "antrenor" || currentRole === "trainer";

  // const getCurrentDashboardPath = () => {
  //   const roleMapping = {
  //     admin: "admin",
  //     antrenor: "antrenor",
  //     membru: "membru",
  //     trainer: "antrenor",
  //   };
  //   const role = session?.user?.role || "membru";
  //   const mappedRole = roleMapping[role as keyof typeof roleMapping] || role;
  //   return `/dashboard/${mappedRole}`;
  // };

  return (
    <div className="flex items-center gap-2">
      {hasAdminAccess && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => router.push("/dashboard/admin")}
        >
          <IconShieldCog className="h-4 w-4" />
          <span>Admin</span>
        </Button>
      )}

      {(hasTrainerAccess || hasAdminAccess) && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1 text-xs"
          onClick={() => router.push("/dashboard/antrenor")}
        >
          <IconBriefcase className="h-4 w-4" />
          <span>Antrenor</span>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src="/avatars/01.png"
                alt={session?.user?.name || ""}
              />
              <AvatarFallback>
                {getInitials(session?.user?.name || "")}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session?.user?.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* <DropdownMenuItem
            onClick={() =>
              router.push(`${getCurrentDashboardPath()}/contul-meu`)
            }
          >
            <IconUserCircle className="mr-2 h-4 w-4" />
            Profil
          </DropdownMenuItem>
          <DropdownMenuSeparator /> */}
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
            Deconectare
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
