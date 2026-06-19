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
import { TrendingUp, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("login");
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
      setError("Invalid email/mobile or password");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <div className="gradient-hero hidden items-center justify-center p-12 lg:flex lg:w-1/2">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <BrandLogo className="text-3xl text-white" />
          <p className="mt-4 text-white/60">
            Your complete investment, referral & SIP platform
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-6">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <Card className="card-shadow-lg">
            <CardContent className="pt-8">
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
                    {t("emailOrMobile")}
                  </label>
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com or +91..."
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
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button
                  variant="accent"
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : t("submit")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                {t("noAccount")}{" "}
                <Link href="/signup" className="font-medium text-accent hover:underline">
                  {t("signupLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
