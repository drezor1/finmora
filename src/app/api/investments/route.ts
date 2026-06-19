import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const items = await prisma.investment.findMany({
    where: { userId: auth.userId },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      plan: i.planName,
      amount: i.amount,
      roi: i.roi,
      monthlyIncome: i.monthlyIncome,
      startDate: formatDate(i.startDate),
      status: i.status.toLowerCase(),
      nextPayout: i.nextPayout ? formatDate(i.nextPayout) : null,
    }))
  );
}
