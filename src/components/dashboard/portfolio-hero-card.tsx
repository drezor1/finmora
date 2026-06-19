import { formatCurrency } from "@/lib/utils";
import { Sparkline } from "@/components/ui/mini-charts";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Shield, TrendingUp } from "lucide-react";
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
      className={cn("relative overflow-hidden rounded-3xl p-6 sm:p-8", className)}
      style={{
        background: "linear-gradient(145deg, #0e1929 0%, #091520 50%, #060c14 100%)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 48px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset",
      }}
    >
      {/* Ambient glows */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(0,217,126,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(212,168,67,0.06) 0%, transparent 70%)" }}
      />

      {/* Grid texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{ background: "rgba(0,217,126,0.12)" }}
              >
                <TrendingUp className="h-3.5 w-3.5 text-accent" strokeWidth={2.5} />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                {labels.greeting}, <span className="text-foreground">{firstName}</span>
              </p>
            </div>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">
              {labels.portfolio}
            </p>
          </div>
          {kycStatus === "verified" && (
            <Badge variant="gold" className="shrink-0">
              <Shield className="mr-1 h-3 w-3" />
              {labels.verified}
            </Badge>
          )}
        </div>

        {/* Main portfolio value */}
        <p
          className="mt-3 font-mono text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          style={{ textShadow: "0 0 40px rgba(240,244,255,0.1)" }}
        >
          {formatCurrency(totalPortfolio)}
        </p>

        {/* Growth pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          {growthPercent > 0 && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-accent"
              style={{ background: "rgba(0,217,126,0.1)", border: "1px solid rgba(0,217,126,0.2)" }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              +{growthPercent.toFixed(1)}% {labels.thisMonth}
            </span>
          )}
          {activePlan && (
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-gold"
              style={{ background: "rgba(212,168,67,0.1)", border: "1px solid rgba(212,168,67,0.2)" }}
            >
              {activePlan}
            </span>
          )}
        </div>

        {/* Sparkline */}
        {sparklineData.length > 1 && (
          <div className="mt-6">
            <Sparkline data={sparklineData} strokeClassName="stroke-accent" />
          </div>
        )}

        {/* Monthly income footer */}
        <div className="mt-5 flex items-center gap-2">
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-accent">+{formatCurrency(monthlyIncome)}</span>
            {" "}monthly income
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
        </div>
      </div>
    </div>
  );
}
