// "use client";

// import { useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";

// export default function MemberDashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     // Redirect if not authenticated
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status, router]);

//   if (status === "loading") {
//     return (
//       <div className="flex h-screen w-full items-center justify-center">
//         <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
//       </div>
//     );
//   }

//   return <>{children}</>;
// }

import { MemberSidebar } from "@/components/member-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function MemberDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <MemberSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
