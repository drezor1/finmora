"use client";

import Script from "next/script";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AdminModal } from "@/components/admin/admin-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { INVESTMENT_PLANS } from "@/lib/constants";
import { apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { PlanConfig } from "@/lib/investment-plans";

type CreateOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  planName: string;
  prefill: { name: string; email: string; contact: string };
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

interface InvestModalProps {
  open: boolean;
  onClose: () => void;
  plan: PlanConfig;
  onSuccess: () => void;
}

export function InvestModal({ open, onClose, plan, onSuccess }: InvestModalProps) {
  const t = useTranslations("dashboard.investments");
  const [amount, setAmount] = useState(String(plan.min));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptReady, setScriptReady] = useState(false);

  async function handleInvest() {
    const value = Number(amount);
    if (!Number.isInteger(value) || value < plan.min || value > plan.max) {
      setError(
        `Enter amount between ${formatCurrency(plan.min)} and ${formatCurrency(plan.max)}`
      );
      return;
    }

    if (!window.Razorpay) {
      setError("Payment gateway is loading. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await apiPost<CreateOrderResponse>("/api/payments/create-order", {
        planSlug: plan.id,
        amount: value,
      });

      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Finmora",
        description: order.planName,
        order_id: order.orderId,
        prefill: order.prefill,
        theme: { color: "#10b981" },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            await apiPost("/api/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            onSuccess();
            onClose();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start payment");
    } finally {
      setLoading(false);
    }
  }

  const roi = plan.roi;
  const previewIncome = Math.round((Number(amount) || 0) * (roi / 100));

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />
      <AdminModal
        open={open}
        onClose={onClose}
        title={`${t("investNow")} — ${plan.name}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            {formatCurrency(plan.min)} – {formatCurrency(plan.max)} · {roi}% {t("perMonth")}
          </p>
          <div>
            <label className="text-sm font-medium text-primary">{t("amount")}</label>
            <Input
              type="number"
              min={plan.min}
              max={plan.max}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
          <p className="text-sm text-accent">
            Est. monthly income: {formatCurrency(previewIncome)}
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="accent"
              className="flex-1"
              onClick={handleInvest}
              disabled={loading || !scriptReady}
            >
              {loading ? "Processing…" : t("investNow")}
            </Button>
          </div>
        </div>
      </AdminModal>
    </>
  );
}