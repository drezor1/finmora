import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "accent" | "outline" | "ghost" | "gold";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-light shadow-sm",
  accent: "bg-accent text-accent-foreground hover:bg-accent-dark shadow-sm shadow-accent/25",
  outline: "border border-border bg-card text-foreground hover:bg-background hover:border-primary/30",
  ghost: "text-foreground hover:bg-background",
  gold: "bg-gold text-primary hover:bg-gold-light shadow-sm",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);

Button.displayName = "Button";
