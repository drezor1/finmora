import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { KYCStatus, WithdrawalStatus } from "@/lib/types";

type Status = KYCStatus | WithdrawalStatus | "active" | "paused" | "pending_ad" | "sent" | "scheduled" | "failed" | "completed";

const styles: Record<string, string> = {
  verified: "bg-accent/10 text-accent-dark border-accent/20",
  approved: "bg-accent/10 text-accent-dark border-accent/20",
  active: "bg-accent/10 text-accent-dark border-accent/20",
  sent: "bg-accent/10 text-accent-dark border-accent/20",
  pending: "bg-gold/15 text-primary border-gold/30",
  pending_ad: "bg-gold/15 text-primary border-gold/30",
  scheduled: "bg-gold/15 text-primary border-gold/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  paused: "bg-muted/10 text-muted border-border",
  completed: "bg-primary/10 text-primary border-primary/20",
};

interface StatusBadgeProps {
  status: Status;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("border capitalize", styles[status] ?? styles.pending, className)}
    >
      {label}
    </Badge>
  );
}
