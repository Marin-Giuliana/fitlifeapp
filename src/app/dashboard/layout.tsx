import { DashboardTransition } from "@/components/dashboard-transition";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardTransition />
      {children}
    </>
  );
}