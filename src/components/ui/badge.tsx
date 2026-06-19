import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

type BadgeVariant = "default" | "accent" | "gold" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "rgba(240,244,255,0.07)",
    color: "rgba(240,244,255,0.75)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  accent: {
    background: "rgba(0,217,126,0.1)",
    color: "#00d97e",
    border: "1px solid rgba(0,217,126,0.2)",
  },
  gold: {
    background: "rgba(212,168,67,0.1)",
    color: "#d4a843",
    border: "1px solid rgba(212,168,67,0.25)",
  },
  outline: {
    background: "transparent",
    color: "rgba(139,154,184,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
};

export function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", className)}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}
