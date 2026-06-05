import { BarChart3, Eye, MessageSquare, Network } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
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
      take: 6,
    }),
  ]);

  const stats = [
    { label: "总留言", value: totalMessages, icon: MessageSquare },
    { label: "公开留言", value: visibleMessages, icon: Eye },
    { label: "今日新增", value: todayMessages, icon: BarChart3 },
    { label: "独立 IP", value: uniqueIps.length, icon: Network },
  ];

  return (
    <AdminShell>
      <div className="space-y-8">
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <stat.icon className="absolute -right-4 -top-4 h-20 w-20 text-bitcoin/10" aria-hidden />
              <p className="font-mono text-xs uppercase tracking-widest text-stardust">{stat.label}</p>
              <p className="mt-3 font-heading text-4xl font-bold text-white">{stat.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <Badge live>Recent blocks</Badge>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-white">最近留言</h2>
            <div className="mt-6 space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-heading font-semibold text-white">{message.username}</p>
                    <time className="font-mono text-xs text-stardust">{formatDateTime(message.createdAt)}</time>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stardust">{message.content}</p>
                </div>
              ))}
              {!recentMessages.length ? <p className="text-stardust">暂无留言。</p> : null}
            </div>
          </Card>

          <Card>
            <Badge>Top IP</Badge>
            <h2 className="mt-4 font-heading text-2xl font-semibold text-white">IP 统计</h2>
            <div className="mt-6 space-y-3">
              {topIps.map((item) => (
                <div key={item.ip} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3">
                  <span className="font-mono text-xs text-stardust">{item.ip}</span>
                  <span className="font-mono text-sm text-bitcoin">{item._count.ip}</span>
                </div>
              ))}
              {!topIps.length ? <p className="text-stardust">暂无 IP 数据。</p> : null}
            </div>
            <p className="mt-5 font-mono text-xs uppercase tracking-widest text-stardust">Visits logged: {totalVisits}</p>
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}
