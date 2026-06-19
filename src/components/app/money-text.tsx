import { cn } from "@/lib/utils";
import { formatCurrency } from "@finmora/shared";

type MoneyVariant = "default" | "positive" | "negative" | "muted";

interface MoneyTextProps {
  amount: number;
  variant?: MoneyVariant;
  showSign?: boolean;
  className?: string;
}

const variantClasses: Record<MoneyVariant, string> = {
  default: "text-primary",
  positive: "text-accent",
  negative: "text-destructive",
  muted: "text-muted",
};

export function MoneyText({
  amount,
  variant = "default",
  showSign = false,
  className,
}: MoneyTextProps) {
  const prefix = showSign && amount > 0 ? "+" : showSign && amount < 0 ? "-" : "";
  const display = formatCurrency(Math.abs(amount));

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums tracking-tight",
        variantClasses[variant],
        className
      )}
    >
      {prefix}
      {display}
    </span>
  );
}
