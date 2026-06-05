import { AdminShell } from "@/components/admin/admin-shell";
import { MessageTable } from "@/components/admin/message-table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireAdmin();
  const messages = await prisma.message.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <Card>
          <Badge>Signal Ledger</Badge>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white">留言管理</h2>
          <p className="mt-3 max-w-2xl text-stardust">
            查看访客用户名、IP、浏览器信息和留言内容。默认软删除，方便上线后审计、恢复与信号节点管理。
          </p>
        </Card>
        <MessageTable messages={messages} />
      </div>
    </AdminShell>
  );
}
