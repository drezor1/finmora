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
import { apiPost } from "@/lib/api-client";

export default function SignupPage() {
  const t = useTranslations("signup");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/api/auth/register", {
        name,
        email,
        mobile,
        referralCode,
        password,
      });
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Account created but login failed. Please sign in.");
        router.push("/login");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="gradient-hero hidden items-center justify-center p-12 lg:flex lg:w-1/2">
        <div className="max-w-md">
          <h2 className="text-3xl font-bold text-white">
            Start Building Your Wealth with Finmora
          </h2>
          <p className="mt-4 text-white/60">
            Invest in Infinity plans, earn monthly ROI, referral income, and
            grow through SIP.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-accent">10.2%</div>
              <div className="text-sm text-white/60">Avg. Monthly ROI</div>
            </div>
          </div>
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
              <BrandLogo className="mb-2 text-xl text-primary" />
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
                    {t("name")}
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("email")}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("mobile")}
                  </label>
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("referralCode")}{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="FM-XXXXXX"
                    required
                  />
                  <p className="mt-1 text-xs text-muted">{t("referralRequired")}</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-primary">
                    {t("password")}
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                  />
                </div>
                <Button
                  variant="accent"
                  className="w-full"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : t("submit")}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                {t("hasAccount")}{" "}
                <Link href="/login" className="font-medium text-accent hover:underline">
                  {t("loginLink")}
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
