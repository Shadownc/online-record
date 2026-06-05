import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestIp, getUserAgent } from "@/lib/ip";
import { checkRateLimit } from "@/lib/rate-limit";
import { getSiteSetting, isMessageOpen } from "@/lib/settings";
import { messageCreateSchema } from "@/lib/validators";

export async function GET() {
  const [setting, messages] = await Promise.all([
    getSiteSetting(),
    prisma.message.findMany({
      where: { visible: true, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, username: true, content: true, createdAt: true },
    }),
  ]);

  const ip = await getRequestIp();
  const userAgent = await getUserAgent();
  await prisma.visitLog.create({ data: { ip, userAgent, path: "/" } }).catch(() => null);

  return NextResponse.json({
    messages,
    setting: {
      messageEnabled: setting.messageEnabled,
      openStartTime: setting.openStartTime,
      openEndTime: setting.openEndTime,
      closedNotice: setting.closedNotice,
      isOpen: isMessageOpen(setting),
    },
  });
}

export async function POST(request: Request) {
  const setting = await getSiteSetting();
  if (!isMessageOpen(setting)) {
    return NextResponse.json({ error: setting.closedNotice }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = messageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "提交内容无效" }, { status: 400 });
  }

  const ip = await getRequestIp();
  const userAgent = await getUserAgent();
  const rateKey = `${ip ?? "unknown"}:${parsed.data.username}`;
  const rate = checkRateLimit(rateKey);
  if (!rate.ok) {
    return NextResponse.json(
      { error: `提交太频繁，请 ${Math.ceil(rate.retryAfterMs / 1000)} 秒后再试` },
      { status: 429 },
    );
  }

  const message = await prisma.message.create({
    data: { username: parsed.data.username, content: parsed.data.content, ip, userAgent },
    select: { id: true, username: true, content: true, createdAt: true },
  });

  return NextResponse.json({ message }, { status: 201 });
}
