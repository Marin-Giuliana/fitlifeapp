"use client";

import { useEffect, useState } from "react";
import { LoadingSpinner } from "./ui/loading-spinner";

interface LoadingDashboardProps {
  children: React.ReactNode;
}

export function LoadingDashboard({ children }: LoadingDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return <>{isLoading ? <LoadingSpinner /> : children}</>;
}
