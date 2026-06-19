import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { SettingsPanel } from "@/components/dashboard/settings-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.settings"
      />
      <div className="p-6">
        <SettingsPanel />
      </div>
    </>
  );
}
