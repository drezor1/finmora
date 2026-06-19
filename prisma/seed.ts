import {
  PrismaClient,
  UserRole,
  KycStatus,
  AccountStatus,
  WithdrawalType,
  WithdrawalStatus,
  InvestmentStatus,
  ReferralEarningStatus,
  PenaltyReason,
  PenaltyStatus,
  SipStatus,
  AdType,
  AdStatus,
  AdInquiryStatus,
  NotificationChannel,
  AdminNotificationStatus,
  UserNotificationType,
  InvoiceStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@123";
  const userPassword = await bcrypt.hash("User@123", 10);
  const adminHash = await bcrypt.hash(adminPassword, 10);

  await prisma.invoice.deleteMany();
  await prisma.userNotification.deleteMany();
  await prisma.adminNotification.deleteMany();
  await prisma.platformSetting.deleteMany();
  await prisma.adInquiry.deleteMany();
  await prisma.ad.deleteMany();
  await prisma.kycDocument.deleteMany();
  await prisma.sipContribution.deleteMany();
  await prisma.sipPlan.deleteMany();
  await prisma.referralPenalty.deleteMany();
  await prisma.referralEarning.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Finmora Admin",
      email: "admin@finmora.in",
      mobile: "+91 90000 00001",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      referralCode: "FM-ADMIN0",
      kycStatus: KycStatus.VERIFIED,
      accountStatus: AccountStatus.ACTIVE,
    },
  });

  const rahul = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "rahul@email.com",
      mobile: "+91 98765 43210",
      passwordHash: userPassword,
      referralCode: "FM-A8K2M9",
      referredById: admin.id,
      kycStatus: KycStatus.VERIFIED,
      accountStatus: AccountStatus.ACTIVE,
      createdAt: new Date("2026-01-15"),
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Patel",
      email: "priya@email.com",
      mobile: "+91 87654 32109",
      passwordHash: userPassword,
      referralCode: "FM-PR3N7X",
      referredById: rahul.id,
      kycStatus: KycStatus.PENDING,
      createdAt: new Date("2026-02-20"),
    },
  });

  const amit = await prisma.user.create({
    data: {
      name: "Amit Kumar",
      email: "amit@email.com",
      mobile: "+91 76543 21098",
      passwordHash: userPassword,
      referralCode: "FM-AM5L2K",
      referredById: rahul.id,
      kycStatus: KycStatus.VERIFIED,
      createdAt: new Date("2025-11-08"),
    },
  });

  const sneha = await prisma.user.create({
    data: {
      name: "Sneha Reddy",
      email: "sneha@email.com",
      mobile: "+91 65432 10987",
      passwordHash: userPassword,
      referralCode: "FM-SN1Q4R",
      kycStatus: KycStatus.REJECTED,
      accountStatus: AccountStatus.SUSPENDED,
      createdAt: new Date("2026-03-01"),
    },
  });

  const vikram = await prisma.user.create({
    data: {
      name: "Vikram Singh",
      email: "vikram@email.com",
      mobile: "+91 54321 09876",
      passwordHash: userPassword,
      referralCode: "FM-VK7P9S",
      referredById: priya.id,
      kycStatus: KycStatus.VERIFIED,
      createdAt: new Date("2026-01-28"),
    },
  });

  await prisma.investment.createMany({
    data: [
      {
        userId: rahul.id,
        planSlug: "infinity-grow",
        planName: "Infinity Grow",
        amount: 250000,
        roi: 10,
        monthlyIncome: 25000,
        status: InvestmentStatus.ACTIVE,
        startDate: new Date("2026-01-15"),
        nextPayout: new Date("2026-07-01"),
      },
      {
        userId: rahul.id,
        planSlug: "infinity-start",
        planName: "Infinity Start",
        amount: 50000,
        roi: 8,
        monthlyIncome: 4000,
        status: InvestmentStatus.ACTIVE,
        startDate: new Date("2025-11-01"),
        nextPayout: new Date("2026-07-01"),
      },
      {
        userId: amit.id,
        planSlug: "infinity-max",
        planName: "Infinity Max",
        amount: 1500000,
        roi: 12,
        monthlyIncome: 180000,
        status: InvestmentStatus.ACTIVE,
        startDate: new Date("2025-11-08"),
      },
      {
        userId: priya.id,
        planSlug: "infinity-start",
        planName: "Infinity Start",
        amount: 50000,
        roi: 8,
        monthlyIncome: 4000,
        status: InvestmentStatus.ACTIVE,
        startDate: new Date("2026-02-20"),
      },
      {
        userId: vikram.id,
        planSlug: "infinity-grow",
        planName: "Infinity Grow",
        amount: 500000,
        roi: 10,
        monthlyIncome: 50000,
        status: InvestmentStatus.ACTIVE,
        startDate: new Date("2026-01-28"),
      },
    ],
  });

  await prisma.kycDocument.createMany({
    data: [
      {
        userId: priya.id,
        docType: "aadhaar",
        s3Key: "local/mock/priya-aadhaar.pdf",
        status: KycStatus.PENDING,
      },
      {
        userId: priya.id,
        docType: "pan",
        s3Key: "local/mock/priya-pan.pdf",
        status: KycStatus.PENDING,
      },
    ],
  });

  await prisma.withdrawal.createMany({
    data: [
      { userId: rahul.id, amount: 25000, type: WithdrawalType.MONTHLY_INCOME, status: WithdrawalStatus.PENDING, requestedAt: new Date("2026-06-18") },
      { userId: rahul.id, amount: 15000, type: WithdrawalType.MONTHLY_INCOME, status: WithdrawalStatus.PENDING, requestedAt: new Date("2026-06-15") },
      { userId: amit.id, amount: 150000, type: WithdrawalType.MONTHLY_INCOME, status: WithdrawalStatus.PENDING, requestedAt: new Date("2026-06-17") },
      { userId: vikram.id, amount: 5000, type: WithdrawalType.REFERRAL_INCOME, status: WithdrawalStatus.PENDING, requestedAt: new Date("2026-06-15") },
      { userId: priya.id, amount: 4000, type: WithdrawalType.MONTHLY_INCOME, status: WithdrawalStatus.APPROVED, requestedAt: new Date("2026-06-01"), processedAt: new Date("2026-06-02") },
      { userId: sneha.id, amount: 2000, type: WithdrawalType.REFERRAL_INCOME, status: WithdrawalStatus.REJECTED, requestedAt: new Date("2026-05-28"), processedAt: new Date("2026-05-29") },
    ],
  });

  await prisma.referralEarning.createMany({
    data: [
      { referrerId: rahul.id, referredUserId: priya.id, depositAmount: 100000, commission: 5000, status: ReferralEarningStatus.PAID, paidAt: new Date("2026-05-28") },
      { referrerId: rahul.id, referredUserId: amit.id, depositAmount: 50000, commission: 2500, status: ReferralEarningStatus.PAID, paidAt: new Date("2026-04-28") },
      { referrerId: rahul.id, referredUserId: vikram.id, depositAmount: 10000, commission: 500, status: ReferralEarningStatus.PAID, paidAt: new Date("2026-03-15") },
      { referrerId: priya.id, referredUserId: vikram.id, depositAmount: 250000, commission: 12500, status: ReferralEarningStatus.PENDING },
    ],
  });

  await prisma.user.update({
    where: { id: rahul.id },
    data: { referralBalance: 8000, monthlyIncomeBalance: 58850 },
  });

  await prisma.user.update({
    where: { id: amit.id },
    data: { monthlyIncomeBalance: 280000 },
  });

  await prisma.user.update({
    where: { id: priya.id },
    data: { monthlyIncomeBalance: 8400 },
  });

  await prisma.user.update({
    where: { id: vikram.id },
    data: { monthlyIncomeBalance: 70000 },
  });

  await prisma.referralPenalty.createMany({
    data: [
      { userId: sneha.id, reason: PenaltyReason.FRAUD, amount: 5000, status: PenaltyStatus.ACTIVE, appliedAt: new Date("2026-05-15") },
      { userId: sneha.id, reason: PenaltyReason.SELF_REFERRAL, amount: 2500, status: PenaltyStatus.ACTIVE, appliedAt: new Date("2026-04-22") },
    ],
  });

  const rahulSip = await prisma.sipPlan.create({
    data: {
      userId: rahul.id,
      lockYears: 3,
      percentOfIncome: 35,
      monthlyAmount: 10150,
      totalContributed: 60900,
      startDate: new Date("2026-01-15"),
      endDate: new Date("2029-01-15"),
      status: SipStatus.ACTIVE,
      lastContributionAt: new Date("2026-06-01"),
    },
  });

  const amitSip = await prisma.sipPlan.create({
    data: {
      userId: amit.id,
      lockYears: 5,
      percentOfIncome: 30,
      monthlyAmount: 54000,
      totalContributed: 324000,
      startDate: new Date("2025-11-08"),
      endDate: new Date("2030-11-08"),
      status: SipStatus.ACTIVE,
      lastContributionAt: new Date("2026-06-01"),
    },
  });

  const vikramSip = await prisma.sipPlan.create({
    data: {
      userId: vikram.id,
      lockYears: 1,
      percentOfIncome: 30,
      monthlyAmount: 15000,
      totalContributed: 75000,
      startDate: new Date("2026-01-28"),
      endDate: new Date("2027-01-28"),
      status: SipStatus.ACTIVE,
      lastContributionAt: new Date("2026-06-01"),
    },
  });

  const priyaSip = await prisma.sipPlan.create({
    data: {
      userId: priya.id,
      lockYears: 1,
      percentOfIncome: 30,
      monthlyAmount: 1200,
      totalContributed: 4800,
      startDate: new Date("2026-02-20"),
      endDate: new Date("2027-02-20"),
      status: SipStatus.ACTIVE,
      lastContributionAt: new Date("2026-06-01"),
    },
  });

  function backfillContributions(
    sipPlanId: string,
    monthlyAmount: number,
    grossIncome: number,
    months: number
  ) {
    return Array.from({ length: months }, (_, i) => {
      const d = new Date("2026-06-01");
      d.setMonth(d.getMonth() - i);
      return {
        sipPlanId,
        amount: monthlyAmount,
        grossIncome,
        contributedAt: d,
      };
    });
  }

  await prisma.sipContribution.createMany({
    data: [
      ...backfillContributions(rahulSip.id, 10150, 29000, 6),
      ...backfillContributions(amitSip.id, 54000, 180000, 6),
      ...backfillContributions(vikramSip.id, 15000, 50000, 5),
      ...backfillContributions(priyaSip.id, 1200, 4000, 4),
    ],
  });

  await prisma.ad.createMany({
    data: [
      { title: "HDFC Life Insurance", type: AdType.COMPANY, advertiser: "HDFC Life", status: AdStatus.ACTIVE, impressions: 0, clicks: 0, startDate: new Date("2026-04-01"), targetUrl: "https://hdfclife.com" },
      { title: "Zerodha Trading Platform", type: AdType.COMPANY, advertiser: "Zerodha", status: AdStatus.ACTIVE, impressions: 0, clicks: 0, startDate: new Date("2026-03-15"), targetUrl: "https://zerodha.com" },
      { title: "Real Estate — Prestige Group", type: AdType.COMPANY, advertiser: "Prestige Estates", status: AdStatus.PENDING, startDate: new Date("2026-06-20"), targetUrl: "https://prestigeestates.com" },
    ],
  });

  await prisma.adInquiry.createMany({
    data: [
      {
        name: "Axis Mutual Fund",
        email: "ads@axismf.com",
        phone: "+91 98765 11111",
        message: "We want to promote our ELSS funds to your investor base.",
        package: "Growth",
        status: AdInquiryStatus.PENDING,
      },
    ],
  });

  await prisma.platformSetting.create({
    data: {
      key: "adsense",
      value: {
        enabled: false,
        publisherId: "",
        adSlotHtml: "",
        lastUpdated: "2026-06-01",
      },
    },
  });

  await prisma.adminNotification.createMany({
    data: [
      { title: "Monthly ROI Credited", channel: NotificationChannel.SMS, audience: "All Active Investors", status: AdminNotificationStatus.SENT, sentAt: new Date("2026-06-01T09:00:00") },
      { title: "KYC Verification Reminder", channel: NotificationChannel.EMAIL, audience: "Pending KYC Users", status: AdminNotificationStatus.SENT, sentAt: new Date("2026-06-15T10:30:00") },
      { title: "New Infinity Max Plan Launch", channel: NotificationChannel.PUSH, audience: "All Users", status: AdminNotificationStatus.SCHEDULED, scheduledAt: new Date("2026-06-20T08:00:00") },
    ],
  });

  await prisma.userNotification.createMany({
    data: [
      { userId: rahul.id, title: "ROI Credited", message: "₹25,000 monthly income credited.", type: UserNotificationType.INCOME, read: false },
      { userId: rahul.id, title: "Referral Joined", message: "Sneha Reddy joined using your referral code.", type: UserNotificationType.REFERRAL, read: false },
      { userId: rahul.id, title: "Withdrawal Pending", message: "Your ₹15,000 withdrawal is under review.", type: UserNotificationType.WITHDRAWAL, read: true },
      { userId: rahul.id, title: "KYC Verified", message: "Your KYC documents have been approved.", type: UserNotificationType.KYC, read: true },
    ],
  });

  await prisma.invoice.createMany({
    data: [
      { userId: rahul.id, invoiceNo: "INV-2026-006", type: "Monthly ROI", amount: 29000, status: InvoiceStatus.PAID, issuedAt: new Date("2026-06-01") },
      { userId: rahul.id, invoiceNo: "INV-2026-007", type: "SIP Contribution", amount: 10150, status: InvoiceStatus.PAID, issuedAt: new Date("2026-06-01") },
      { userId: rahul.id, invoiceNo: "INV-2026-005", type: "Referral Commission", amount: 5000, status: InvoiceStatus.PAID, issuedAt: new Date("2026-05-28") },
      { userId: rahul.id, invoiceNo: "INV-2026-001", type: "Investment Receipt", amount: 250000, status: InvoiceStatus.PAID, issuedAt: new Date("2026-01-15") },
    ],
  });

  console.log("Seed complete.");
  console.log("Admin:", admin.email, "password:", adminPassword);
  console.log("User:", rahul.email, "password: User@123");
  console.log("Referral codes: FM-ADMIN0, FM-A8K2M9");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
