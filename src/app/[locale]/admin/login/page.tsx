"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Shield, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const t = useTranslations("adminPanel.login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid admin credentials");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backHome")}
        </Link>

        <Card className="card-shadow-lg">
          <CardContent className="pt-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
                <Shield className="h-6 w-6 text-gold" />
              </div>
              <div>
                <BrandLogo className="text-xl text-primary" />
                <p className="text-xs font-medium uppercase tracking-widest text-gold">
                  Admin
                </p>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-primary">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted">{t("subtitle")}</p>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {error && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  {t("email")}
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@finmora.in"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-primary">
                  {t("password")}
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-muted">{t("demoHint")}</p>
              <Button
                variant="accent"
                className="w-full"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in..." : t("submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
