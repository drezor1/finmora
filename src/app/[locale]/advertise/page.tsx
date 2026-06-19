"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiPost } from "@/lib/api-client";
import { ArrowLeft, Megaphone, Building, CheckCircle2 } from "lucide-react";

const PACKAGES = [
  { id: "starter", name: "Starter", price: "₹5,000/mo", reach: "Dashboard banner" },
  { id: "growth", name: "Growth", price: "₹15,000/mo", reach: "Banner + priority rotation" },
  { id: "premium", name: "Premium", price: "₹35,000/mo", reach: "Top slot + featured badge" },
];

export default function AdvertisePage() {
  const t = useTranslations("advertise");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [pkg, setPkg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiPost("/api/advertise/inquiry", {
        name,
        email,
        phone: phone || undefined,
        message,
        package: pkg || undefined,
      });
      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setPkg("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-hero px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <Badge variant="gold" className="glass mb-4 border-white/20 text-white">
            {t("packages")}
          </Badge>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-white/70">{t("subtitle")}</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="transition-all hover:card-shadow-lg">
              <CardContent className="flex items-start gap-4 pt-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                  <Building className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">
                    {t("companyAd")}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{t("companyAdDesc")}</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {PACKAGES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPkg(p.name)}
                  className={`rounded-xl border p-4 text-left transition-all ${
                    pkg === p.name
                      ? "border-accent bg-accent/5 ring-2 ring-accent/20"
                      : "border-border bg-card hover:border-accent/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">{p.name}</span>
                    <span className="text-sm font-medium text-accent">{p.price}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{p.reach}</p>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-primary p-6">
              <Megaphone className="h-10 w-10 text-accent" />
              <div>
                <div className="text-2xl font-bold text-white">12,500+</div>
                <div className="text-sm text-white/60">{t("reach")}</div>
              </div>
            </div>
          </div>

          <Card className="card-shadow-lg">
            <CardContent className="pt-8">
              <h2 className="text-xl font-bold text-primary">{t("inquiry")}</h2>

              {success ? (
                <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-accent" />
                  <p className="font-medium text-primary">{t("successTitle")}</p>
                  <p className="text-sm text-muted">{t("successMessage")}</p>
                  <Button variant="outline" onClick={() => setSuccess(false)}>
                    {t("submitAnother")}
                  </Button>
                </div>
              ) : (
                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      {t("name")}
                    </label>
                    <Input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      {t("email")}
                    </label>
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="business@email.com"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      {t("phone")}
                    </label>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-primary">
                      {t("message")}
                    </label>
                    <textarea
                      required
                      minLength={10}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex min-h-[120px] w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                      placeholder="Describe your advertising needs..."
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button
                    variant="accent"
                    className="w-full"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? t("submitting") : t("submit")}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
