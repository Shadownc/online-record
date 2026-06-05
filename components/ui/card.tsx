import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-bitcoin/50 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.2)]",
        className,
      )}
      {...props}
    />
  );
}

export function GlassCard({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-white/10 bg-black/40 p-6 shadow-card backdrop-blur-lg", className)} {...props} />;
}
