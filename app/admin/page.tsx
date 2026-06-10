import { BarChart3, Eye, MessageSquare, Network } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/admin/page-header";
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
      <div className="space-y-6">
        <PageHeader
          badge="Dashboard"
          title="数据概览"
          description="实时查看留言统计、访问数据和最近活动。"
        />

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <stat.icon className="pointer-events-none absolute right-6 top-6 h-16 w-16 text-signal/8" aria-hidden />
              <p className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">{stat.label}</p>
              <p className="relative mt-3 font-heading text-4xl font-bold text-white">{stat.value}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <Card>
            <Badge live>Recent signals</Badge>
            <h2 className="mt-4 font-heading text-xl font-semibold text-white">最近留言</h2>
            <div className="mt-6 space-y-3">
              {recentMessages.map((message) => (
                <div key={message.id} className="group rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-white/20 hover:bg-black/30">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="font-heading font-semibold text-white">{message.username}</p>
                    <time className="font-mono text-xs text-stardust">{formatDateTime(message.createdAt)}</time>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-stardust">{message.content}</p>
                </div>
              ))}
              {!recentMessages.length ? (
                <p className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center text-sm text-stardust">
                  暂无留言
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <Badge>Top IP</Badge>
            <h2 className="mt-4 font-heading text-xl font-semibold text-white">活跃 IP</h2>
            <div className="mt-6 space-y-2">
              {topIps.map((item) => (
                <div key={item.ip} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-black/30">
                  <span className="font-mono text-xs text-stardust">{item.ip}</span>
                  <span className="rounded-full bg-signal/15 px-3 py-1 font-mono text-sm font-medium text-signal">{item._count.ip}</span>
                </div>
              ))}
              {!topIps.length ? (
                <p className="rounded-xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center text-sm text-stardust">
                  暂无数据
                </p>
              ) : null}
            </div>
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-stardust">
              Visits logged <span className="text-white">{totalVisits}</span>
            </p>
          </Card>
        </section>
      </div>
    </AdminShell>
  );
}
