"use client";

// Simplified date picker component that doesn't use react-day-picker
import * as React from "react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  // placeholder = "Selectează o dată",
  className,
}: DatePickerProps) {
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, "d MMMM yyyy", { locale: ro });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center">
        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            !value && "text-muted-foreground"
          )}
        />
      </div>
      {value && (
        <div className="text-xs text-muted-foreground pl-6">
          {formatDate(value)}
        </div>
      )}
    </div>
  );
}
