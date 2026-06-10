import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, route } from "@/lib/api";

export const GET = route(async () => {
  await requireAdmin();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalMessages, visibleMessages, todayMessages, totalVisits, uniqueIps, recentMessages, topIps] = await Promise.all([
    prisma.message.count({ where: { deletedAt: null } }),
    prisma.message.count({ where: { deletedAt: null, visible: true } }),
    prisma.message.count({ where: { deletedAt: null, createdAt: { gte: today } } }),
    prisma.visitLog.count(),
    prisma.message.groupBy({ by: ["ip"], where: { ip: { not: null }, deletedAt: null } }),
    prisma.message.findMany({ where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.message.groupBy({
      by: ["ip"],
      where: { ip: { not: null }, deletedAt: null },
      _count: { ip: true },
      orderBy: { _count: { ip: "desc" } },
      take: 8,
    }),
  ]);

  return ok({
    stats: { totalMessages, visibleMessages, todayMessages, totalVisits, uniqueIps: uniqueIps.length },
    recentMessages,
    topIps,
  });
});
