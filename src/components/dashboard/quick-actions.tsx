import { Link } from "@/i18n/routing";
import { Wallet, Banknote, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

type QuickActionsProps = {
  labels: { invest: string; withdraw: string; share: string };
  referralCode?: string;
  className?: string;
};

export function QuickActions({ labels, referralCode, className }: QuickActionsProps) {
  const actions = [
    {
      href: "/dashboard/investments",
      icon: Wallet,
      label: labels.invest,
      variant: "accent" as const,
    },
    {
      href: "/dashboard/withdrawals",
      icon: Banknote,
      label: labels.withdraw,
      variant: "neutral" as const,
    },
    {
      href: "/dashboard/referrals",
      icon: Share2,
      label: labels.share,
      variant: "gold" as const,
    },
  ];

  function handleShare() {
    if (!referralCode || !navigator.share) return;
    navigator.share({
      title: "Join Finmora",
      text: `Use my referral code ${referralCode} to join Finmora!`,
    }).catch(() => {});
  }

  const iconBg: Record<string, string> = {
    accent: "rgba(0,217,126,0.12)",
    neutral: "rgba(255,255,255,0.06)",
    gold: "rgba(212,168,67,0.12)",
  };

  const iconColor: Record<string, string> = {
    accent: "var(--accent)",
    neutral: "var(--foreground-muted)",
    gold: "var(--gold)",
  };

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {actions.map(({ href, icon: Icon, label, variant }, i) =>
        i === 2 && referralCode && typeof navigator !== "undefined" && "share" in navigator ? (
          <button
            key={href}
            type="button"
            onClick={handleShare}
            className="group flex flex-col items-center gap-2.5 rounded-2xl px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              background: "linear-gradient(145deg, #0f1623 0%, #0a0e18 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ background: iconBg[variant] }}
            >
              <Icon className="h-5 w-5" style={{ color: iconColor[variant] }} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </button>
        ) : (
          <Link
            key={href}
            href={href}
            className="group flex flex-col items-center gap-2.5 rounded-2xl px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            style={{
              background: "linear-gradient(145deg, #0f1623 0%, #0a0e18 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
            }}
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
              style={{ background: iconBg[variant] }}
            >
              <Icon className="h-5 w-5" style={{ color: iconColor[variant] }} />
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </Link>
        )
      )}
    </div>
  );
}
