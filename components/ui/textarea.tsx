import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-32 w-full resize-y rounded-xl border border-white/10 bg-[#030712]/75 px-4 py-3 text-sm leading-relaxed text-white placeholder:text-white/30 transition-all duration-200 focus-visible:border-signal focus-visible:outline-none focus-visible:shadow-[0_12px_24px_-12px_rgba(34,211,238,0.45)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
