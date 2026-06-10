import { type Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, parse, readJson, route } from "@/lib/api";
import { messageBulkActionSchema } from "@/lib/validators";

/**
 * 对一批留言（按 id）执行批量操作：
 * - hide    隐藏（visible=false），仅作用于未删除留言
 * - show    恢复可见（visible=true），仅作用于未删除留言
 * - delete  软删除（置 deletedAt + 隐藏），仅作用于未删除留言
 * - restore 从回收站恢复（清空 deletedAt + 恢复可见），仅作用于已删除留言
 * - purge   永久硬删除（关联 reaction 级联删除）
 * 返回受影响的条数。
 */
export const POST = route(async (request) => {
  await requireAdmin();

  const { ids, action } = parse(messageBulkActionSchema, await readJson(request));

  if (action === "purge") {
    const result = await prisma.message.deleteMany({ where: { id: { in: ids } } });
    return ok({ count: result.count });
  }

  // 各操作的过滤条件与数据更新：delete/hide/show 只动未删除项，restore 只动已删除项。
  const presets: Record<
    Exclude<typeof action, "purge">,
    { where: Prisma.MessageWhereInput; data: Prisma.MessageUpdateManyMutationInput }
  > = {
    hide: { where: { deletedAt: null }, data: { visible: false } },
    show: { where: { deletedAt: null }, data: { visible: true } },
    delete: { where: { deletedAt: null }, data: { deletedAt: new Date(), visible: false } },
    restore: { where: { deletedAt: { not: null } }, data: { deletedAt: null, visible: true } },
  };

  const preset = presets[action];
  const result = await prisma.message.updateMany({
    where: { id: { in: ids }, ...preset.where },
    data: preset.data,
  });

  return ok({ count: result.count });
});
