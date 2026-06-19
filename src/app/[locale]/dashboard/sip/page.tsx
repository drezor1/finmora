import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { SipPanel } from "@/components/dashboard/sip-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function SipPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader titleKey="title" subtitleKey="subtitle" namespace="dashboard.sip" />
      <div className="p-6">
        <SipPanel />
      </div>
    </>
  );
}
