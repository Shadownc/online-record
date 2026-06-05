import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "sci-panel sci-border rounded-2xl border p-6 shadow-card backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-signal/45 hover:shadow-signal",
        className,
      )}
      {...props}
    />
  );
}

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sci-panel sci-border rounded-2xl border p-6 shadow-card backdrop-blur-xl", className)} {...props} />;
}
