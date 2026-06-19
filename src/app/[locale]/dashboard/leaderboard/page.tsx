import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { LeaderboardPanel } from "@/components/dashboard/leaderboard-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function LeaderboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.leaderboard"
      />
      <div className="p-6">
        <LeaderboardPanel />
      </div>
    </>
  );
}
