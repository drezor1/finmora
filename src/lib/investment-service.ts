import { prisma } from "@/lib/db";
import { REFERRAL_COMMISSION } from "@/lib/constants";
import {
  computeMonthlyIncome,
  addDays,
  getPlanBySlug,
} from "@/lib/investment-plans";
import {
  InvestmentStatus,
  ReferralEarningStatus,
  InvoiceStatus,
  UserNotificationType,
  type Prisma,
} from "@prisma/client";

type TxClient = Prisma.TransactionClient;

async function nextInvoiceNo(tx: TxClient): Promise<string> {
  const year = new Date().getFullYear();
  const count = await tx.invoice.count({
    where: {
      invoiceNo: { startsWith: `INV-${year}-` },
    },
  });
  return `INV-${year}-${String(count + 1).padStart(3, "0")}`;
}

export async function fulfillPayment(
  razorpayOrderId: string,
  razorpayPaymentId: string
) {
  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          referredById: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "PAID") {
    return { alreadyFulfilled: true, paymentId: payment.id };
  }

  if (payment.razorpayPaymentId && payment.razorpayPaymentId !== razorpayPaymentId) {
    throw new Error("Payment ID mismatch");
  }

  const existingByPaymentId = await prisma.payment.findUnique({
    where: { razorpayPaymentId },
  });
  if (existingByPaymentId && existingByPaymentId.id !== payment.id) {
    return { alreadyFulfilled: true, paymentId: existingByPaymentId.id };
  }

  const startDate = new Date();
  const nextPayout = addDays(startDate, 30);
  const plan = getPlanBySlug(payment.planSlug);
  const roi = plan?.roi ?? 10;
  const monthlyIncome = computeMonthlyIncome(payment.amount, roi);

  const result = await prisma.$transaction(async (tx) => {
    const investment = await tx.investment.create({
      data: {
        userId: payment.userId,
        planSlug: payment.planSlug,
        planName: payment.planName,
        amount: payment.amount,
        roi,
        monthlyIncome,
        status: InvestmentStatus.ACTIVE,
        startDate,
        nextPayout,
      },
    });

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId,
        investmentId: investment.id,
        paidAt: new Date(),
      },
    });

    const invoiceNo = await nextInvoiceNo(tx);
    await tx.invoice.create({
      data: {
        userId: payment.userId,
        invoiceNo,
        type: "Investment Receipt",
        amount: payment.amount,
        status: InvoiceStatus.PAID,
      },
    });

    if (payment.user.referredById) {
      const commission = Math.round((payment.amount * REFERRAL_COMMISSION) / 100);
      await tx.referralEarning.create({
        data: {
          referrerId: payment.user.referredById,
          referredUserId: payment.userId,
          depositAmount: payment.amount,
          commission,
          status: ReferralEarningStatus.PENDING,
        },
      });

      await tx.userNotification.create({
        data: {
          userId: payment.user.referredById,
          title: "Referral Deposit",
          message: `${payment.user.name} invested ₹${payment.amount.toLocaleString("en-IN")}. You earned ₹${commission.toLocaleString("en-IN")} referral commission.`,
          type: UserNotificationType.REFERRAL,
        },
      });
    }

    return { investment, payment: updatedPayment };
  });

  const { notifyUser } = await import("@/lib/notification-service");
  await notifyUser(payment.userId, {
    title: "Investment Confirmed",
    message: `Your ${payment.planName} investment of ₹${payment.amount.toLocaleString("en-IN")} is active. Monthly income: ₹${monthlyIncome.toLocaleString("en-IN")}.`,
    type: UserNotificationType.INCOME,
    sendEmail: true,
  });

  return { alreadyFulfilled: false, ...result };
}
