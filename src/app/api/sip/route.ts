import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser, jsonError } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";
import {
  daysUntil,
  enrollSip,
  getUserMonthlyIncome,
  updateSipAllocation,
} from "@/lib/sip-service";
import { sipEnrollSchema, sipUpdateSchema } from "@/lib/validators/sip";

async function buildSipResponse(userId: string) {
  const [sip, grossIncome, hasInvestment] = await Promise.all([
    prisma.sipPlan.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { startDate: "desc" },
      include: {
        contributions: { orderBy: { contributedAt: "desc" }, take: 12 },
      },
    }),
    getUserMonthlyIncome(userId),
    prisma.investment.count({ where: { userId, status: "ACTIVE" } }),
  ]);

  const canEnroll = !sip && hasInvestment > 0 && grossIncome > 0;

  if (!sip) {
    return {
      active: false,
      status: null as null,
      lockYears: 3 as const,
      percentOfIncome: 30,
      monthlyContribution: 0,
      totalContributed: 0,
      startDate: null,
      endDate: null,
      projectedValue: 0,
      daysRemaining: 0,
      canEnroll,
      grossMonthlyIncome: grossIncome,
      history: [] as Array<{ month: string; amount: number }>,
    };
  }

  const history = sip.contributions.map((c) => ({
    month: c.contributedAt.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    }),
    amount: c.amount,
  }));

  return {
    active: true,
    status: sip.status.toLowerCase(),
    lockYears: sip.lockYears as 1 | 3 | 5,
    percentOfIncome: sip.percentOfIncome,
    monthlyContribution: sip.monthlyAmount,
    totalContributed: sip.totalContributed,
    startDate: formatDate(sip.startDate),
    endDate: formatDate(sip.endDate),
    projectedValue: Math.round(sip.totalContributed * 1.15),
    daysRemaining: daysUntil(sip.endDate),
    canEnroll: false,
    grossMonthlyIncome: grossIncome,
    history,
  };
}

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  return NextResponse.json(await buildSipResponse(auth.userId));
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = sipEnrollSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid SIP enrollment request");

  try {
    await enrollSip(
      auth.userId,
      parsed.data.lockYears,
      parsed.data.percentOfIncome
    );
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to enroll SIP");
  }

  return NextResponse.json(await buildSipResponse(auth.userId));
}

export async function PATCH(request: Request) {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const body = await request.json();
  const parsed = sipUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid SIP update request");

  try {
    await updateSipAllocation(auth.userId, parsed.data.percentOfIncome);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Failed to update SIP");
  }

  return NextResponse.json(await buildSipResponse(auth.userId));
}
