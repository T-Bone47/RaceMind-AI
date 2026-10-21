import { type HTMLAttributes, forwardRef } from "react";

import { cn } from "./utils/cn";

export const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-[#2A2D33] bg-[#17191D] p-6 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mb-4 flex items-center justify-between", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-sm font-medium uppercase tracking-wide text-[#9CA3AF]", className)}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";
