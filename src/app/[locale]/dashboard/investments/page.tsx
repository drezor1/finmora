import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { InvestmentsPanel } from "@/components/dashboard/investments-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function InvestmentsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.investments"
      />
      <div className="p-6">
        <InvestmentsPanel />
      </div>
    </>
  );
}
