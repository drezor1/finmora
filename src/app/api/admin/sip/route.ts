import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.sipPlan.findMany({
    include: { user: { select: { name: true } } },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(
    items.map((s) => ({
      id: s.id,
      userName: s.user.name,
      amount: s.monthlyAmount,
      monthlyAmount: s.monthlyAmount,
      totalContributed: s.totalContributed,
      lockYears: s.lockYears,
      percentOfIncome: s.percentOfIncome,
      startDate: formatDate(s.startDate),
      endDate: formatDate(s.endDate),
      status: s.status.toLowerCase(),
    }))
  );
}
