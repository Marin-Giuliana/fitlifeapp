import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Extend the next-auth session types
declare module "next-auth" {
  interface User {
    id?: string;
    role?: string;
  }
  
  interface Session {
    user?: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export async function getSession() {
  return getServerSession();
}

// Function to get current session on the server-side
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

// Function to check if user is authenticated
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/login");
  }
  
  return user;
}

// Function to check if user has specific role
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  
  if (!user.role || !allowedRoles.includes(user.role)) {
    // Redirect to default dashboard if user lacks required role
    redirect("/dashboard/member");
  }
  
  return user;
}

// Helper to use in client components
export function useAuthRedirect(role: string) {
  switch(role) {
    case "admin":
      return "/dashboard/admin";
    case "trainer":
      return "/dashboard/trainer";
    default:
      return "/dashboard/member";
  }
}