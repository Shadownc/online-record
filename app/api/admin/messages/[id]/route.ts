import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, readJson, route } from "@/lib/api";

export const PATCH = route<{ params: { id: string } }>(async (request, { params }) => {
  await requireAdmin();
  const body = (await readJson(request)) as { visible?: unknown; deleted?: unknown; restore?: unknown } | null;

  const message = await prisma.message.update({
    where: { id: params.id },
    data: {
      ...(typeof body?.visible === "boolean" ? { visible: body.visible } : {}),
      ...(body?.deleted === true ? { deletedAt: new Date(), visible: false } : {}),
      // 从回收站恢复：清空软删除标记，默认恢复为可见。
      ...(body?.restore === true ? { deletedAt: null, visible: true } : {}),
    },
  });

  return ok({ message });
});

/** 永久删除（硬删除）。仅用于回收站，不可恢复。关联 reaction 会级联删除。 */
export const DELETE = route<{ params: { id: string } }>(async (_request, { params }) => {
  await requireAdmin();

  await prisma.message.delete({ where: { id: params.id } });

  return ok({ ok: true });
});
