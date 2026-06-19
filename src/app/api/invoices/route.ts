import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";

export async function GET() {
  const auth = await requireUser();
  if ("error" in auth) return auth.error;

  const items = await prisma.invoice.findMany({
    where: { userId: auth.userId },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json(
    items.map((i) => ({
      id: i.invoiceNo,
      type: i.type,
      amount: i.amount,
      date: formatDate(i.issuedAt),
      status: i.status.toLowerCase(),
    }))
  );
}
