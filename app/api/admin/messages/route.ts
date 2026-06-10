import { type Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, parse, readJson, route } from "@/lib/api";
import { messageBulkDeleteSchema } from "@/lib/validators";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/** 把 yyyy-MM-dd 解析为当天起始/结束时刻；无效返回 undefined。 */
function parseDate(value: string | null, endOfDay = false) {
  if (!value) return undefined;
  const date = new Date(`${value}T${endOfDay ? "23:59:59.999" : "00:00:00.000"}`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export const GET = route(async (request) => {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const ip = searchParams.get("ip")?.trim();
  const deleted = searchParams.get("deleted") === "true";
  const visible = searchParams.get("visible"); // "visible" | "hidden" | 其它(全部)
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const startDate = parseDate(searchParams.get("startDate"));
  const endDate = parseDate(searchParams.get("endDate"), true);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

  const createdAt =
    startDate || endDate ? { ...(startDate ? { gte: startDate } : {}), ...(endDate ? { lte: endDate } : {}) } : undefined;

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
      orderBy: { createdAt: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return ok({ messages, pagination: { page, pageSize, total, totalPages } });
});

export const DELETE = route(async (request) => {
  await requireAdmin();

  const parsed = parse(messageBulkDeleteSchema, await readJson(request));

  const result = await prisma.message.updateMany({
    where: {
      deletedAt: null,
      ...(parsed.ip ? { ip: parsed.ip } : { username: parsed.username }),
    },
    data: { deletedAt: new Date(), visible: false },
  });

  return ok({ count: result.count });
});
