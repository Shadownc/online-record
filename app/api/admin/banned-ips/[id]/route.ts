import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await requireAdmin();

  await prisma.bannedIp.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
