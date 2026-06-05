import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-signal via-cyan-300 to-plasma text-white shadow-[0_0_22px_-6px_rgba(34,211,238,0.58)] hover:scale-[1.03] hover:shadow-signal",
        outline:
          "border-2 border-signal/25 bg-signal/5 text-white hover:border-signal/55 hover:bg-signal/10 hover:text-signal",
        ghost: "text-white hover:bg-signal/10 hover:text-signal",
        link: "min-h-0 rounded-none px-0 py-0 text-signal underline-offset-4 hover:underline",
        danger: "border border-red-500/40 bg-red-500/10 text-red-100 hover:border-red-400 hover:bg-red-500/20",
      },
      size: {
        sm: "min-h-9 px-4 text-xs",
        md: "min-h-11 px-5 text-sm",
        lg: "min-h-12 px-7 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
));
Button.displayName = "Button";

export { buttonVariants };
