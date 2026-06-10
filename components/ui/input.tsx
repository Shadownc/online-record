import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-11 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white transition-colors placeholder:text-stardust/60 hover:border-white/30 focus:border-signal/60 focus:outline-none focus:ring-2 focus:ring-signal/20 disabled:cursor-not-allowed disabled:opacity-50",
      type === "date" && "appearance-none [color-scheme:dark]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
