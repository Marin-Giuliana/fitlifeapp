import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getDashboardUrl } from "@/lib/roleRedirect";

/**
 * Hook to redirect users to their appropriate dashboard based on role
 * @param redirectOnAuth - Whether to redirect automatically when authenticated
 * @param fallbackUrl - URL to redirect to if user is not authenticated
 */
export function useRoleRedirect(
  redirectOnAuth: boolean = false,
  fallbackUrl: string = "/login"
) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session && fallbackUrl) {
      router.push(fallbackUrl);
      return;
    }

    if (redirectOnAuth && session?.user?.role) {
      const dashboardUrl = getDashboardUrl(session.user.role);
      router.push(dashboardUrl);
    }
  }, [session, status, router, redirectOnAuth, fallbackUrl]);

  return {
    session,
    status,
    isAuthenticated: !!session,
    userRole: session?.user?.role,
    getDashboardForCurrentUser: () => 
      session?.user?.role ? getDashboardUrl(session.user.role) : fallbackUrl,
  };
}