import { type VariantProps, cva } from "class-variance-authority";
import { type HTMLAttributes, forwardRef } from "react";

import { cn } from "./utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium font-mono tabular-nums",
  {
    variants: {
      variant: {
        neutral: "bg-[#212429] text-[#9CA3AF]",
        blue: "bg-[#2F7FFF]/15 text-[#2F7FFF]",
        green: "bg-[#22D67A]/15 text-[#22D67A]",
        amber: "bg-[#FFB020]/15 text-[#FFB020]",
        red: "bg-[#FF4D4D]/15 text-[#FF4D4D]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  /** Renders a small pulsing dot before the label - use for "live" states. */
  pulse?: boolean;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, pulse, children, ...props }, ref) => (
    <span ref={ref} className={cn(badgeVariants({ variant }), className)} {...props}>
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
