"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[70vh]">
      <div
        className={cn(
          "inline-block h-16 w-16 animate-spin rounded-full border-8 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] [border-radius:50%]",
          className
        )}
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Se încarcă...
        </span>
      </div>
    </div>
  );
}