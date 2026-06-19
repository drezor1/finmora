import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { formatDate } from "@/lib/serializers";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const items = await prisma.adInquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      name: i.name,
      email: i.email,
      phone: i.phone,
      message: i.message,
      package: i.package,
      status: i.status.toLowerCase(),
      createdAt: formatDate(i.createdAt),
    }))
  );
}
