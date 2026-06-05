import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  await requireAdmin();
  const body = await request.json().catch(() => ({}));

  const message = await prisma.message.update({
    where: { id: params.id },
    data: {
      ...(typeof body.visible === "boolean" ? { visible: body.visible } : {}),
      ...(body.deleted === true ? { deletedAt: new Date(), visible: false } : {}),
    },
  });

  return NextResponse.json({ message });
}
