import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, route } from "@/lib/api";

export const DELETE = route<{ params: { id: string } }>(async (_request, { params }) => {
  await requireAdmin();

  await prisma.bannedIp.delete({ where: { id: params.id } });

  return ok({ ok: true });
});
