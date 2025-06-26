"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardUrl } from "@/lib/roleRedirect";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthCallback() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (status === "unauthenticated") {
      // Not authenticated, redirect to login
      router.push("/login");
      return;
    }

    if (session?.user?.role) {
      // Authenticated with role, redirect to appropriate dashboard
      const dashboardUrl = getDashboardUrl(session.user.role);
      router.push(dashboardUrl);
    } else {
      // Authenticated but no role, fallback to membru dashboard
      router.push("/dashboard/membru");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="text-center">
        <LoadingSpinner></LoadingSpinner>
      </div>
    </div>
  );
}
