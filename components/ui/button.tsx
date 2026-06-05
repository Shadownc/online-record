import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-burnt to-bitcoin text-white shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-105 hover:shadow-orange",
        outline:
          "border-2 border-white/20 bg-transparent text-white hover:border-white hover:bg-white/10",
        ghost: "text-white hover:bg-white/10 hover:text-bitcoin",
        link: "min-h-0 rounded-none px-0 py-0 text-bitcoin underline-offset-4 hover:underline",
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
