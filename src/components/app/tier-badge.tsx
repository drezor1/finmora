import { getPlanById } from "@finmora/shared";
import { cn } from "@/lib/utils";

interface TierBadgeProps {
  planId: string;
  label?: string;
  className?: string;
}

export function TierBadge({ planId, label, className }: TierBadgeProps) {
  const plan = getPlanById(planId);
  const name = label ?? plan?.name ?? planId;

  const style = plan
    ? { backgroundColor: `${plan.tierColor}18`, color: plan.tierColor, borderColor: `${plan.tierColor}40` }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        className
      )}
      style={style}
    >
      {name}
    </span>
  );
}
