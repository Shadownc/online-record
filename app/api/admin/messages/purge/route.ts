import { type Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, readJson, route } from "@/lib/api";

/** 永久删除（硬删除）回收站中指定 IP 或用户名的所有留言 */
export const POST = route(async (request) => {
  await requireAdmin();

  const body = (await readJson(request)) as { ip?: string; username?: string; deleted: true } | null;

  if (!body?.deleted || (!body.ip && !body.username)) {
    return new Response("Invalid request", { status: 400 });
  }

  const where: Prisma.MessageWhereInput = {
    deletedAt: { not: null },
    ...(body.ip ? { ip: body.ip } : { username: body.username }),
  };

  const result = await prisma.message.deleteMany({ where });

  return ok({ count: result.count });
});
