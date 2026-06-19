"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useState } from "react";

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

function MobilePayContent() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ready" | "paying" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Loading payment…");

  const token = params.get("token") ?? "";
  const orderId = params.get("orderId") ?? "";
  const key = params.get("key") ?? "";
  const amount = params.get("amount") ?? "";
  const currency = params.get("currency") ?? "INR";
  const planName = params.get("planName") ?? "Investment";
  const name = params.get("name") ?? "";
  const email = params.get("email") ?? "";
  const contact = params.get("contact") ?? "";

  const startPayment = useCallback(() => {
    if (!window.Razorpay || !token || !orderId || !key) {
      setStatus("error");
      setMessage("Missing payment details. Close and try again from the app.");
      return;
    }

    setStatus("paying");
    const rzp = new window.Razorpay({
      key,
      amount: Number(amount),
      currency,
      name: "Finmora",
      description: planName,
      order_id: orderId,
      prefill: { name, email, contact },
      theme: { color: "#10b981" },
      handler: async (response: RazorpayHandlerResponse) => {
        try {
          const res = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error ?? "Verification failed");
          }
          setStatus("success");
          setMessage("Payment successful! Return to the Finmora app.");
        } catch (e) {
          setStatus("error");
          setMessage(e instanceof Error ? e.message : "Payment verification failed");
        }
      },
      modal: {
        ondismiss: () => {
          setStatus("ready");
          setMessage("Payment cancelled. Tap Pay again or return to the app.");
        },
      },
    });
    rzp.open();
  }, [amount, contact, currency, email, key, name, orderId, planName, token]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0B1220",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          setStatus("ready");
          setMessage("Tap below to complete your investment.");
        }}
        onError={() => {
          setStatus("error");
          setMessage("Failed to load payment gateway.");
        }}
      />
      <div style={{ maxWidth: 360, textAlign: "center" }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Finmora</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>{planName}</p>
        <p style={{ marginBottom: 24 }}>{message}</p>
        {status === "ready" && (
          <button
            type="button"
            onClick={startPayment}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 28px",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Pay now
          </button>
        )}
        {status === "success" && (
          <p style={{ color: "#10b981", fontWeight: 600 }}>✓ Done</p>
        )}
      </div>
    </main>
  );
}

export default function MobilePayPage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", background: "#0B1220" }}>
          <p style={{ color: "#fff", textAlign: "center", paddingTop: 48 }}>Loading…</p>
        </main>
      }
    >
      <MobilePayContent />
    </Suspense>
  );
}
