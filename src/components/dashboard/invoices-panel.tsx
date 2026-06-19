"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { DashboardPanelSkeleton } from "@/components/dashboard/dashboard-skeletons";

type Invoice = {
  id: string;
  type: string;
  amount: number;
  date: string;
  status: string;
};

export function InvoicesPanel() {
  const t = useTranslations("dashboard.invoices");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Invoice[]>("/api/invoices")
      .then(setInvoices)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <DashboardPanelSkeleton rows={6} />;
  }

  if (error) {
    return <p className="py-8 text-center text-sm text-destructive">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <h2 className="text-lg font-semibold text-primary">{t("title")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted">
                  <th className="pb-3 pr-4">{t("invoiceId")}</th>
                  <th className="pb-3 pr-4">{t("type")}</th>
                  <th className="pb-3 pr-4">{t("amount")}</th>
                  <th className="pb-3 pr-4">{t("date")}</th>
                  <th className="pb-3 pr-4">{t("status")}</th>
                  <th className="pb-3">{t("action")}</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs">{inv.id}</td>
                    <td className="py-3 pr-4">{inv.type}</td>
                    <td className="py-3 pr-4 font-medium">{formatCurrency(inv.amount)}</td>
                    <td className="py-3 pr-4 text-muted">{inv.date}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="accent">{inv.status}</Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted" />
          <p className="mt-3 text-sm text-muted">{t("generateNote")}</p>
          <Button variant="outline" className="mt-4 gap-2">
            <Download className="h-4 w-4" />
            {t("downloadAll")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
