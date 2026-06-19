import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
        <Icon className="h-7 w-7 text-accent" />
      </div>
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6">
          <Button variant="accent">{actionLabel}</Button>
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button variant="accent" className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
