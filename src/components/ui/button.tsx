import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "rgba(240, 244, 255, 0.9)",
    color: "#07090f",
    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  },
  accent: {
    background: "linear-gradient(135deg, #00d97e 0%, #00b869 100%)",
    color: "#07090f",
    boxShadow: "0 4px 16px rgba(0,217,126,0.25), 0 1px 0 rgba(255,255,255,0.15) inset",
  },
  outline: {
    background: "rgba(255,255,255,0.03)",
    color: "var(--foreground)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  ghost: {
    background: "transparent",
    color: "var(--foreground-muted)",
  },
  gold: {
    background: "linear-gradient(135deg, #d4a843 0%, #b8892e 100%)",
    color: "#07090f",
    boxShadow: "0 4px 16px rgba(212,168,67,0.2)",
  },
};

const variantHover: Record<ButtonVariant, string> = {
  primary: "hover:opacity-90",
  accent: "hover:opacity-90 hover:shadow-lg",
  outline: "hover:bg-white/[0.06] hover:border-white/[0.15]",
  ghost: "hover:bg-white/[0.05] hover:text-foreground",
  gold: "hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-6 text-sm rounded-xl",
  lg: "h-12 px-8 text-base rounded-xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", style, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200",
        "disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
        variantHover[variant],
        sizes[size],
        className
      )}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  )
);

Button.displayName = "Button";
