import { setRequestLocale } from "next-intl/server";
import { DashboardPageHeader } from "@/components/dashboard/page-header";
import { InvoicesPanel } from "@/components/dashboard/invoices-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function InvoicesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <DashboardPageHeader
        titleKey="title"
        subtitleKey="subtitle"
        namespace="dashboard.invoices"
      />
      <div className="p-6">
        <InvoicesPanel />
      </div>
    </>
  );
}
