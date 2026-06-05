import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSetting } from "@/lib/settings";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  await requireAdmin();
  const setting = await getSiteSetting();
  return NextResponse.json({ setting });
}

export async function PATCH(request: Request) {
  await requireAdmin();
  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "设置无效" }, { status: 400 });
  }

  const setting = await prisma.siteSetting.update({
    where: { id: "singleton" },
    data: {
      messageEnabled: parsed.data.messageEnabled,
      openStartTime: parsed.data.openStartTime ? new Date(parsed.data.openStartTime) : null,
      openEndTime: parsed.data.openEndTime ? new Date(parsed.data.openEndTime) : null,
      closedNotice: parsed.data.closedNotice,
    },
  });

  return NextResponse.json({ setting });
}
