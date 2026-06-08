import { type Prisma } from "@prisma/client";
import { AdminShell } from "@/components/admin/admin-shell";
import { MessageTable } from "@/components/admin/message-table";
import { Pagination } from "@/components/admin/pagination";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MessagesPage({
  searchParams,
}: {
  searchParams?: { page?: string | string[]; q?: string | string[]; ip?: string | string[] };
}) {
  await requireAdmin();

  const page = parsePage(searchParams?.page);
  const q = getSingleParam(searchParams?.q)?.trim();
  const ip = getSingleParam(searchParams?.ip)?.trim();
  const where: Prisma.MessageWhereInput = {
    deletedAt: null,
    ...(q ? { OR: [{ username: { contains: q } }, { content: { contains: q } }] } : {}),
    ...(ip ? { ip } : {}),
  };

  const [total, messages] = await prisma.$transaction([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell>
      <div className="space-y-6">
        <Card>
          <Badge>Signal Ledger</Badge>
          <h2 className="mt-4 font-heading text-2xl font-bold text-white">留言管理</h2>
          <p className="mt-3 max-w-2xl text-sm text-stardust">
            查看访客用户名、IP、浏览器信息和留言内容。默认软删除，方便上线后审计、恢复与信号节点管理。
          </p>
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-stardust">
            Total <span className="text-white">{total}</span> · Page <span className="text-white">{page}</span> / <span className="text-white">{totalPages}</span>
          </p>
        </Card>
        <MessageTable messages={messages} />
        <Pagination page={page} totalPages={totalPages} basePath="/admin/messages" searchParams={{ q, ip }} />
      </div>
    </AdminShell>
  );
}
