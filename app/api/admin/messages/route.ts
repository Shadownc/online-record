import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const ip = searchParams.get("ip")?.trim();

  const messages = await prisma.message.findMany({
    where: {
      deletedAt: null,
      ...(q ? { OR: [{ username: { contains: q } }, { content: { contains: q } }] } : {}),
      ...(ip ? { ip } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ messages });
}
