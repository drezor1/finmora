import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "gold" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary",
  accent: "bg-accent/10 text-accent-dark",
  gold: "bg-gold/15 text-primary border border-gold/30",
  outline: "border border-border text-muted bg-card",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
