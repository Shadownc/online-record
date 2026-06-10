import { type Prisma } from "@prisma/client";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { MessageFilter } from "@/components/admin/message-filter";
import { MessageTable } from "@/components/admin/message-table";
import { Pagination } from "@/components/admin/pagination";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 10;

function parsePage(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getSingleParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw?.trim() || undefined;
}

/** 把 yyyy-MM-dd 解析为当天起始/结束时刻；无效返回 undefined。 */
function parseDate(value: string | undefined, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type SearchParams = {
  page?: string | string[];
  q?: string | string[];
  ip?: string | string[];
  tab?: string | string[];
  visible?: string | string[];
  startDate?: string | string[];
  endDate?: string | string[];
  order?: string | string[];
};

export default async function MessagesPage({ searchParams }: { searchParams?: SearchParams }) {
  await requireAdmin();

  const page = parsePage(searchParams?.page);
  const q = getSingleParam(searchParams?.q);
  const ip = getSingleParam(searchParams?.ip);
  const deleted = getSingleParam(searchParams?.tab) === "trash";
  const visible = getSingleParam(searchParams?.visible);
  const startDate = getSingleParam(searchParams?.startDate);
  const endDate = getSingleParam(searchParams?.endDate);
  const order = getSingleParam(searchParams?.order) === "asc" ? "asc" : "desc";

  const createdAtRange = parseDate(startDate);
  const createdAtEnd = parseDate(endDate, true);
  const createdAt =
    createdAtRange || createdAtEnd
      ? { ...(createdAtRange ? { gte: createdAtRange } : {}), ...(createdAtEnd ? { lte: createdAtEnd } : {}) }
      : undefined;

  const where: Prisma.MessageWhereInput = {
    deletedAt: deleted ? { not: null } : null,
    ...(q ? { OR: [{ username: { contains: q } }, { content: { contains: q } }] } : {}),
    ...(ip ? { ip } : {}),
    ...(visible === "visible" ? { visible: true } : visible === "hidden" ? { visible: false } : {}),
    ...(createdAt ? { createdAt } : {}),
  };

  const [total, messages] = await prisma.$transaction([
    prisma.message.count({ where }),
    prisma.message.findMany({
      where,
      orderBy: deleted ? { deletedAt: order } : { createdAt: order },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const tabClass = "inline-flex min-h-10 items-center rounded-lg border px-5 py-2 text-sm font-medium transition-all duration-300";
  const activeClass = "border-signal/55 bg-signal/15 text-signal";
  const idleClass = "border-white/15 bg-white/5 text-stardust hover:border-signal/35 hover:bg-white/10 hover:text-white";

  // 分页链接需保留所有筛选条件（空值不写入）。
  const carryParams: Record<string, string | undefined> = {
    q,
    ip,
    visible,
    startDate,
    endDate,
    order: order === "asc" ? "asc" : undefined,
    tab: deleted ? "trash" : undefined,
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl font-bold text-white">留言管理</h1>
              <span className="rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-xs text-signal">
                {total} 条
              </span>
            </div>
            <p className="mt-2 text-sm text-stardust">查看访客用户名、IP、浏览器信息和留言内容。默认软删除，方便上线后审计、恢复与信号节点管理。</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/admin/messages" className={cn(tabClass, deleted ? idleClass : activeClass)}>
              留言列表
            </Link>
            <Link href="/admin/messages?tab=trash" className={cn(tabClass, deleted ? activeClass : idleClass)}>
              回收站
            </Link>
          </div>
        </div>
        <MessageFilter values={{ q, ip, visible, startDate, endDate, order }} tab={deleted ? "trash" : undefined} />
        <MessageTable messages={messages} deleted={deleted} />
        <Pagination page={page} totalPages={totalPages} basePath="/admin/messages" searchParams={carryParams} />
      </div>
    </AdminShell>
  );
}
