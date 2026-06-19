import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const referrers = await prisma.user.findMany({
    where: { role: "USER" },
    include: {
      referralEarnings: true,
      _count: { select: { referrals: true } },
    },
  });

  const ranked = referrers
    .map((u) => ({
      name: u.name,
      referrals: u._count.referrals,
      earnings: u.referralEarnings.reduce((s, e) => s + e.commission, 0),
    }))
    .filter((r) => r.referrals > 0)
    .sort((a, b) => b.referrals - a.referrals)
    .slice(0, 10);

  const me = await prisma.user.findUnique({ where: { id: auth.userId } });

  return NextResponse.json(
    ranked.map((r, i) => ({
      rank: i + 1,
      name: r.name,
      referrals: r.referrals,
      earnings: r.earnings,
      badge: i === 0 ? "gold" : i === 1 ? "silver" : i === 2 ? "bronze" : "none",
      isYou: me?.name === r.name,
    }))
  );
}
