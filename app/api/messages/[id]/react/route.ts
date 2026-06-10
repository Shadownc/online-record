import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, route } from "@/lib/api";
import { getRequestIp } from "@/lib/ip";
import { isIpBanned } from "@/lib/ip-ban";

/**
 * 切换某条留言的共鸣（点赞）。按 IP 去重：
 * - 未点过 → 新增一条 reaction，reacted = true
 * - 已点过 → 删除该 reaction，reacted = false
 * 返回最新计数与当前 IP 的点赞状态。
 */
export const POST = route<{ params: { id: string } }>(async (_request, { params }) => {
  const ip = await getRequestIp();
  if (!ip) {
    throw new ApiError("无法识别来源，暂时无法共鸣。", 400);
  }
  if (await isIpBanned(ip)) {
    throw new ApiError("当前 IP 已被封禁。", 403, { banned: true });
  }

  const message = await prisma.message.findFirst({
    where: { id: params.id, visible: true, deletedAt: null },
    select: { id: true },
  });
  if (!message) {
    throw new ApiError("留言不存在或已下线。", 404);
  }

  const existing = await prisma.messageReaction.findUnique({
    where: { messageId_ip: { messageId: params.id, ip } },
    select: { id: true },
  });

  let reacted: boolean;
  if (existing) {
    await prisma.messageReaction.delete({ where: { id: existing.id } });
    reacted = false;
  } else {
    // 并发下唯一约束可能冲突，吞掉 P2002 视作已点赞
    await prisma.messageReaction
      .create({ data: { messageId: params.id, ip } })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
          return null;
        }
        throw error;
      });
    reacted = true;
  }

  const reactionCount = await prisma.messageReaction.count({ where: { messageId: params.id } });

  return ok({ reacted, reactionCount });
});
