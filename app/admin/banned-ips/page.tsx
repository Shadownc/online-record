import { AdminShell } from "@/components/admin/admin-shell";
import { BannedIpManager } from "@/components/admin/banned-ip-manager";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
        <Card>
          <Badge>Access Control</Badge>
          <h2 className="mt-4 font-heading text-2xl font-bold text-white">封禁 IP 管理</h2>
          <p className="mt-3 max-w-2xl text-sm text-stardust">
            管理被禁止访问留言区和提交留言的 IP。被封禁 IP 打开首页时会看到访问受限提示，直接调用留言接口也会被拒绝。
          </p>
        </Card>
        <BannedIpManager bannedIps={bannedIps} />
      </div>
    </AdminShell>
  );
}
