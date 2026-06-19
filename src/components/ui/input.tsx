import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-11 w-full rounded-xl border px-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/25",
      className
    )}
    style={{
      background: "rgba(255,255,255,0.03)",
      borderColor: "rgba(255,255,255,0.09)",
    }}
    {...props}
  />
));

Input.displayName = "Input";
