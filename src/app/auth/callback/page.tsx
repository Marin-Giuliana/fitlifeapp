"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getDashboardUrl } from "@/lib/roleRedirect";

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Se încarcă...</p>
      </div>
    </div>
  );
}