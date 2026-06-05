import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 transition-all duration-200 focus-visible:border-bitcoin focus-visible:outline-none focus-visible:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
