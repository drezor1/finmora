import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { ReferralsPanel } from "@/components/dashboard/referrals-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function ReferralsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.referrals"
      />
      <div className="p-6">
        <ReferralsPanel />
      </div>
    </>
  );
}
