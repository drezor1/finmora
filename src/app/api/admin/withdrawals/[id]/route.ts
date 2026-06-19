import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin, jsonError } from "@/lib/api-auth";
import { toWithdrawalStatus } from "@/lib/serializers";
import { notifyUser } from "@/lib/notification-service";
import { UserNotificationType, type WithdrawalStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;
  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: "approved" | "rejected" };

  if (!status) return jsonError("Status required");

  const existing = await prisma.withdrawal.findUnique({ where: { id } });
  if (!existing) return jsonError("Withdrawal not found", 404);

  if (existing.status !== "PENDING") {
    return jsonError("Withdrawal has already been processed", 400);
  }

  const amountLabel = existing.amount.toLocaleString("en-IN");

  if (status === "approved") {
    try {
      await prisma.$transaction(async (tx) => {
        if (existing.type === "REFERRAL_INCOME") {
          const user = await tx.user.findUnique({
            where: { id: existing.userId },
            select: { referralBalance: true },
          });
          if (!user || user.referralBalance < existing.amount) {
            throw new Error("Insufficient referral balance to approve withdrawal");
          }
          await tx.user.update({
            where: { id: existing.userId },
            data: { referralBalance: { decrement: existing.amount } },
          });
        } else if (existing.type === "MONTHLY_INCOME") {
          const user = await tx.user.findUnique({
            where: { id: existing.userId },
            select: { monthlyIncomeBalance: true },
          });
          if (!user || user.monthlyIncomeBalance < existing.amount) {
            throw new Error("Insufficient monthly income balance to approve withdrawal");
          }
          await tx.user.update({
            where: { id: existing.userId },
            data: { monthlyIncomeBalance: { decrement: existing.amount } },
          });
        }

        await tx.withdrawal.update({
          where: { id },
          data: {
            status: "APPROVED" as WithdrawalStatus,
            processedAt: new Date(),
          },
        });
      });

      await notifyUser(existing.userId, {
        title: "Withdrawal Approved",
        message: `Your withdrawal of ₹${amountLabel} has been approved.`,
        type: UserNotificationType.WITHDRAWAL,
        sendEmail: true,
      });
    } catch (e) {
      return jsonError(
        e instanceof Error ? e.message : "Failed to approve withdrawal",
        400
      );
    }
  } else {
    await prisma.withdrawal.update({
      where: { id },
      data: {
        status: "REJECTED" as WithdrawalStatus,
        processedAt: new Date(),
      },
    });

    await notifyUser(existing.userId, {
      title: "Withdrawal Rejected",
      message: `Your withdrawal of ₹${amountLabel} has been rejected.`,
      type: UserNotificationType.WITHDRAWAL,
      sendEmail: true,
    });
  }

  const withdrawal = await prisma.withdrawal.findUnique({ where: { id } });
  if (!withdrawal) return jsonError("Withdrawal not found", 404);

  return NextResponse.json({
    id: withdrawal.id,
    status: toWithdrawalStatus(withdrawal.status),
  });
}
