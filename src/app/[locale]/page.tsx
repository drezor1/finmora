import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/landing/hero";
import { ProblemSection } from "@/components/landing/problem-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { PlansSection } from "@/components/landing/plans-section";
import { SipSection } from "@/components/landing/sip-section";
import { ReferralSection } from "@/components/landing/referral-section";
import { WithdrawalSection } from "@/components/landing/withdrawal-section";
import { RevenueSection } from "@/components/landing/revenue-section";
import { CtaSection } from "@/components/landing/cta-section";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return createPageMetadata({
    title: t("title"),
    description: t("description"),
    locale,
  });
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <PlansSection />
        <SipSection />
        <ReferralSection />
        <WithdrawalSection />
        <RevenueSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
