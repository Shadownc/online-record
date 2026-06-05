import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-12 w-full border-0 border-b-2 border-white/20 bg-[#030712]/70 px-4 py-2 text-sm text-white placeholder:text-white/30 transition-all duration-200 focus-visible:border-signal focus-visible:outline-none focus-visible:shadow-[0_12px_24px_-12px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";
