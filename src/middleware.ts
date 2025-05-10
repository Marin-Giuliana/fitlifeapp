import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Get the pathname from the URL
  const path = request.nextUrl.pathname;
  
  // Define public routes
  const isPublicRoute = 
    // path === "/" || 
    path === "/login" || 
    path === "/register" || 
    path.startsWith("/api/");
  
  // Auth checks
  if (!isAuthenticated && !isPublicRoute) {
    // Redirect to login if user tries to access protected route without auth
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // Role-based route protection
  if (isAuthenticated && !isPublicRoute) {
    const userRole = token.role as string;
    
    // Check if the user is trying to access a dashboard they shouldn't
    if (path.startsWith("/dashboard/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
    
    if (path.startsWith("/dashboard/trainer") && userRole !== "trainer" && userRole !== "admin") {
      return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on specified routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};