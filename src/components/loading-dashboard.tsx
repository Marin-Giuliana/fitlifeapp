"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "./ui/loading-spinner";

interface LoadingDashboardProps {
  children: React.ReactNode;
}

export function LoadingDashboard({ children }: LoadingDashboardProps) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return <>{isLoading ? <LoadingSpinner /> : children}</>;
}
