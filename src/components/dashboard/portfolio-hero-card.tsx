import { formatCurrency } from "@/lib/utils";
import { Sparkline } from "@/components/ui/mini-charts";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

type PortfolioHeroCardProps = {
  userName: string;
  totalPortfolio: number;
  monthlyIncome: number;
  growthPercent: number;
  kycStatus: string;
  activePlan: string | null;
  sparklineData?: number[];
  className?: string;
  labels: {
    greeting: string;
    portfolio: string;
    thisMonth: string;
    verified: string;
  };
};

export function PortfolioHeroCard({
  userName,
  totalPortfolio,
  monthlyIncome,
  growthPercent,
  kycStatus,
  activePlan,
  sparklineData = [],
  className,
  labels,
}: PortfolioHeroCardProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div
      className={cn(
        "gradient-hero relative overflow-hidden rounded-3xl p-6 text-white card-shadow-lg sm:p-8",
        className
      )}
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/60">
              {labels.greeting}, {firstName}
            </p>
            <p className="mt-1 text-xs uppercase tracking-widest text-white/40">
              {labels.portfolio}
            </p>
          </div>
          {kycStatus === "verified" && (
            <Badge variant="gold" className="glass shrink-0 border-white/20 text-white">
              <Shield className="mr-1 h-3 w-3" />
              {labels.verified}
            </Badge>
          )}
        </div>

        <p className="mt-4 font-mono text-4xl font-bold tracking-tight sm:text-5xl">
          {formatCurrency(totalPortfolio)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          {growthPercent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-1 text-xs font-medium text-accent">
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{growthPercent.toFixed(1)}% {labels.thisMonth}
            </span>
          )}
          {activePlan && (
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/80">
              {activePlan}
            </span>
          )}
        </div>

        {sparklineData.length > 1 && (
          <div className="mt-6 opacity-90">
            <Sparkline
              data={sparklineData}
              strokeClassName="stroke-accent"
            />
          </div>
        )}

        <p className="mt-4 text-sm text-white/50">
          +{formatCurrency(monthlyIncome)} monthly income
        </p>
      </div>
    </div>
  );
}
