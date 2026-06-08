import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ipBanCreateSchema } from "@/lib/validators";

export async function GET() {
  await requireAdmin();

  const bannedIps = await prisma.bannedIp.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ bannedIps });
}

export async function POST(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const parsed = ipBanCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "封禁信息无效" }, { status: 400 });
  }

  const bannedIp = await prisma.bannedIp.upsert({
    where: { ip: parsed.data.ip },
    create: { ip: parsed.data.ip, reason: parsed.data.reason || null },
    update: { reason: parsed.data.reason || null },
  });

  return NextResponse.json({ bannedIp }, { status: 201 });
}
