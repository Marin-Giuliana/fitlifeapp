"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

export function DashboardTransition() {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const currentDashboardType = useRef("");
  const lastDashboardType = useRef("");
  const isTransitioningRef = useRef(false);

  useEffect(() => {
    if (!pathname.includes("/dashboard")) return;

    const parts = pathname.split("/");
    currentDashboardType.current = parts.length >= 3 ? parts[2] : "";

    if (initialLoad) {
      setIsTransitioning(true);
      isTransitioningRef.current = true;
      lastDashboardType.current = currentDashboardType.current;

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        isTransitioningRef.current = false;
        setInitialLoad(false);
      }, 1500);

      return () => clearTimeout(timer);
    }

    if (
      !isTransitioningRef.current &&
      currentDashboardType.current !== lastDashboardType.current &&
      currentDashboardType.current
    ) {
      setIsTransitioning(true);
      isTransitioningRef.current = true;

      const timer = setTimeout(() => {
        setIsTransitioning(false);
        isTransitioningRef.current = false;
        lastDashboardType.current = currentDashboardType.current;
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [pathname, initialLoad]);

  if (!isTransitioning) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/logo.png"
          alt="FitLife Logo"
          width={150}
          height={150}
          className="animate-pulse"
          priority
        />
      </div>
    </div>
  );
}
