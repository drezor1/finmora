import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Banknote,
  Share2,
  PiggyBank,
  Megaphone,
  Bell,
  ArrowRight,
  Shield,
} from "lucide-react";

const adminFeatures = [
  { key: "users" as const, icon: Users, href: "/admin/users" },
  { key: "withdrawals" as const, icon: Banknote, href: "/admin/withdrawals" },
  { key: "referrals" as const, icon: Share2, href: "/admin/referrals" },
  { key: "sip" as const, icon: PiggyBank, href: "/admin/sip" },
  { key: "ads" as const, icon: Megaphone, href: "/admin/ads" },
  { key: "notifications" as const, icon: Bell, href: "/admin/notifications" },
];

export function AdminSection() {
  const t = useTranslations("admin");

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-primary">
            <Shield className="h-4 w-4 text-gold" />
            Admin
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-lg text-muted">{t("subtitle")}</p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminFeatures.map(({ key, icon: Icon, href }) => (
            <Link key={key} href={href}>
              <Card className="group h-full transition-all hover:-translate-y-0.5 hover:border-accent/30 hover:card-shadow-lg">
                <CardContent className="flex items-start gap-4 py-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 transition-colors group-hover:bg-accent/10">
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-muted">
                      {t(`features.${key}`)}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/admin">
            <Button variant="primary" size="lg">
              <Shield className="h-4 w-4" />
              Open Admin Panel
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
