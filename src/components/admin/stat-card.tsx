import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  change?: string;
  trend?: "up" | "down" | "neutral";
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  change,
  trend = "neutral",
  accent,
}: StatCardProps) {
  return (
    <Card className="transition-all hover:card-shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              accent ? "bg-accent/10" : "bg-primary/5"
            )}
          >
            <Icon
              className={cn("h-5 w-5", accent ? "text-accent" : "text-primary")}
            />
          </div>
          {change && (
            <span
              className={cn(
                "text-xs font-medium",
                trend === "up" && "text-success",
                trend === "down" && "text-destructive",
                trend === "neutral" && "text-muted"
              )}
            >
              {change}
            </span>
          )}
        </div>
        <p className="mt-4 text-sm text-muted">{label}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </CardContent>
    </Card>
  );
}
