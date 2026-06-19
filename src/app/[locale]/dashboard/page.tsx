import { setRequestLocale } from "next-intl/server";
import { DashboardOverviewHeader } from "@/components/dashboard/page-header";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

type Props = { params: Promise<{ locale: string }> };

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardOverviewHeader />
      <DashboardOverview />
    </>
  );
}
