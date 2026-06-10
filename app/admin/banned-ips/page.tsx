import { AdminShell } from "@/components/admin/admin-shell";
import { BannedIpManager } from "@/components/admin/banned-ip-manager";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BannedIpsPage() {
  await requireAdmin();

  const bannedIps = await prisma.bannedIp.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          badge="Access Control"
          title="封禁 IP 管理"
          description="管理被禁止访问留言区和提交留言的 IP。被封禁 IP 打开首页时会看到访问受限提示，直接调用留言接口也会被拒绝。"
          stats={[{ label: "Total Banned", value: bannedIps.length }]}
        />
        <BannedIpManager bannedIps={bannedIps} />
      </div>
    </AdminShell>
  );
}
