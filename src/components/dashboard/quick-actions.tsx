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
      accent: true,
    },
    {
      href: "/dashboard/withdrawals",
      icon: Banknote,
      label: labels.withdraw,
      accent: false,
    },
    {
      href: "/dashboard/referrals",
      icon: Share2,
      label: labels.share,
      accent: false,
    },
  ];

  function handleShare() {
    if (!referralCode || !navigator.share) return;
    navigator.share({
      title: "Join Finmora",
      text: `Use my referral code ${referralCode} to join Finmora!`,
    }).catch(() => {});
  }

  return (
    <div className={cn("grid grid-cols-3 gap-3", className)}>
      {actions.map(({ href, icon: Icon, label, accent }, i) =>
        i === 2 && referralCode && typeof navigator !== "undefined" && "share" in navigator ? (
          <button
            key={href}
            type="button"
            onClick={handleShare}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 transition-all hover:-translate-y-0.5 hover:card-shadow-lg active:scale-[0.98]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary">{label}</span>
          </button>
        ) : (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-3 py-4 transition-all hover:-translate-y-0.5 hover:card-shadow-lg active:scale-[0.98]"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl",
                accent ? "bg-accent text-white" : "bg-primary/5"
              )}
            >
              <Icon className={cn("h-5 w-5", accent ? "text-white" : "text-accent")} />
            </div>
            <span className="text-xs font-medium text-primary">{label}</span>
          </Link>
        )
      )}
    </div>
  );
}
