"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";

export function ContactPageContent() {
  const t = useTranslations("pages.contact");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const contactItems = [
    { icon: Mail, label: t("info.email"), value: "support@finmora.in" },
    { icon: Phone, label: t("info.phone"), value: "+91 1800-XXX-XXXX" },
    { icon: MapPin, label: t("info.address"), value: t("info.addressValue") },
    { icon: Clock, label: t("info.hours"), value: t("info.hoursValue") },
  ];

  return (
    <div className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {contactItems.map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{label}</p>
                    <p className="mt-1 text-sm text-muted">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="lg:col-span-3">
            <CardContent className="pt-8">
              <h2 className="text-xl font-semibold text-primary">
                {t("form.title")}
              </h2>
              <p className="mt-2 text-sm text-muted">{t("form.subtitle")}</p>

              {submitted ? (
                <div className="mt-8 rounded-xl bg-accent/10 p-6 text-center text-sm text-accent-dark">
                  {t("form.success")}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("form.name")}
                      </label>
                      <Input required />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">
                        {t("form.email")}
                      </label>
                      <Input type="email" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      {t("form.subject")}
                    </label>
                    <Input required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      {t("form.message")}
                    </label>
                    <textarea
                      required
                      rows={5}
                      className="flex w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <Button type="submit" variant="accent">
                    {t("form.submit")}
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
