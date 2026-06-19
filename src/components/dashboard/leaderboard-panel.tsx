"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Crown } from "lucide-react";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";

type LeaderboardEntry = {
  rank: number;
  name: string;
  referrals: number;
  earnings: number;
  badge: "gold" | "silver" | "bronze" | "none";
  isYou?: boolean;
};

function RankIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-gold" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
  return <span className="w-5 text-center text-sm font-bold text-muted">#{rank}</span>;
}

export function LeaderboardPanel() {
  const t = useTranslations("dashboard.leaderboard");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<LeaderboardEntry[]>("/api/leaderboard")
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardPanelSkeleton rows={8} />;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {entries.slice(0, 3).map((entry) => (
          <Card
            key={entry.rank}
            className={cn(
              entry.rank === 1 && "ring-2 ring-gold",
              entry.isYou && "ring-2 ring-accent"
            )}
          >
            <CardContent className="pt-6 text-center">
              <RankIcon rank={entry.rank} />
              <p className="mt-2 font-bold text-primary">{entry.name}</p>
              <p className="text-2xl font-bold text-accent">{entry.referrals}</p>
              <p className="text-xs text-muted">{t("referrals")}</p>
              <p className="mt-2 text-sm font-medium">{formatCurrency(entry.earnings)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">{t("fullRankings")}</h2>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={cn(
                  "flex items-center justify-between py-4",
                  entry.isYou && "rounded-xl bg-accent/5 px-3 -mx-3"
                )}
              >
                <div className="flex items-center gap-4">
                  <RankIcon rank={entry.rank} />
                  <div>
                    <p className="font-medium text-primary">
                      {entry.name}
                      {entry.isYou && (
                        <Badge variant="accent" className="ml-2">{t("you")}</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted">
                      {entry.referrals} {t("referrals")}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-accent">{formatCurrency(entry.earnings)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
