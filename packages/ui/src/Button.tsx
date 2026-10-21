import { type VariantProps, cva } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "./utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2F7FFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0B0D] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-[#2F7FFF] text-white hover:bg-[#1B4FB0]",
        secondary:
          "bg-[#17191D] text-[#F5F6F7] border border-[#2A2D33] hover:border-[#2F7FFF]/60 hover:bg-[#212429]",
        ghost: "text-[#9CA3AF] hover:text-[#F5F6F7] hover:bg-[#17191D]",
        destructive: "bg-[#FF4D4D] text-white hover:bg-[#e63e3e]",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
