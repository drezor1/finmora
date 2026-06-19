import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { WithdrawalsPanel } from "@/components/dashboard/withdrawals-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function WithdrawalsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.withdrawals"
      />
      <div className="p-6">
        <WithdrawalsPanel />
      </div>
    </>
  );
}
