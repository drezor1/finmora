import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { addDays } from "@/lib/investment-plans";
import { InvoiceStatus, UserNotificationType } from "@prisma/client";
import {
  completeMatureSips,
  getUserMonthlyIncome,
  processMonthlySip,
} from "@/lib/sip-service";
import { creditMonthlyIncome, deductMonthlyBalance } from "@/lib/withdrawal-service";

async function nextInvoiceNo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const latest = await prisma.invoice.findFirst({
    where: { invoiceNo: { startsWith: prefix } },
    orderBy: { invoiceNo: "desc" },
  });
  const next = latest
    ? parseInt(latest.invoiceNo.slice(prefix.length), 10) + 1
    : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export async function GET(request: Request) {
  const secret = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.investment.findMany({
    where: {
      status: "ACTIVE",
      nextPayout: { lte: now },
    },
    include: {
      user: { select: { id: true } },
    },
  });

  let credited = 0;
  const sipProcessedUsers = new Set<string>();
  const sipResults: Array<{ userId: string; sipAmount: number; skipped: boolean }> = [];

  for (const investment of due) {
    const invoiceNo = await nextInvoiceNo();

    await prisma.$transaction(async (tx) => {
      await tx.invoice.create({
        data: {
          userId: investment.userId,
          invoiceNo,
          type: "Monthly ROI",
          amount: investment.monthlyIncome,
          status: InvoiceStatus.PAID,
        },
      });
      await tx.userNotification.create({
        data: {
          userId: investment.userId,
          title: "ROI Credited",
          message: `₹${investment.monthlyIncome.toLocaleString("en-IN")} monthly income credited for ${investment.planName}.`,
          type: UserNotificationType.INCOME,
        },
      });
      await tx.investment.update({
        where: { id: investment.id },
        data: {
          nextPayout: addDays(investment.nextPayout ?? now, 30),
        },
      });
      await creditMonthlyIncome(investment.userId, investment.monthlyIncome, tx);
    });

    credited += 1;
    sipProcessedUsers.add(investment.userId);
  }

  for (const userId of sipProcessedUsers) {
    const grossIncome = await getUserMonthlyIncome(userId);
    const result = await processMonthlySip(userId, grossIncome);
    if (!result.skipped && result.sipAmount > 0) {
      await deductMonthlyBalance(userId, result.sipAmount);
    }
    sipResults.push({
      userId,
      sipAmount: result.sipAmount,
      skipped: result.skipped,
    });
  }

  const maturity = await completeMatureSips();

  return NextResponse.json({
    credited,
    sipProcessed: sipResults.filter((r) => !r.skipped).length,
    sipResults,
    matured: maturity.completed,
    processedAt: now.toISOString(),
  });
}
