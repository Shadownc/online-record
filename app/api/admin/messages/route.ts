import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageBulkDeleteSchema } from "@/lib/validators";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const ip = searchParams.get("ip")?.trim();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = Math.min(parsePositiveInt(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);

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
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return NextResponse.json({ messages, pagination: { page, pageSize, total, totalPages } });
}

export async function DELETE(request: Request) {
  await requireAdmin();

  const body = await request.json().catch(() => null);
  const parsed = messageBulkDeleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "删除条件无效" }, { status: 400 });
  }

  const result = await prisma.message.updateMany({
    where: {
      deletedAt: null,
      ...(parsed.data.ip ? { ip: parsed.data.ip } : { username: parsed.data.username }),
    },
    data: { deletedAt: new Date(), visible: false },
  });

  return NextResponse.json({ count: result.count });
}
