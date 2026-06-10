import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, parse, readJson, route } from "@/lib/api";
import { getSiteSetting } from "@/lib/settings";
import { settingsSchema } from "@/lib/validators";

export const GET = route(async () => {
  await requireAdmin();
  const setting = await getSiteSetting();
  return ok({ setting });
});

export const PATCH = route(async (request) => {
  await requireAdmin();
  const data = parse(settingsSchema, await readJson(request));

  const setting = await prisma.siteSetting.update({
    where: { id: "singleton" },
    data: {
      messageEnabled: data.messageEnabled,
      openStartTime: data.openStartTime ? new Date(data.openStartTime) : null,
      openEndTime: data.openEndTime ? new Date(data.openEndTime) : null,
      closedNotice: data.closedNotice,
      usernameMaxLength: data.usernameMaxLength,
      contentMaxLength: data.contentMaxLength,
      rateLimitSeconds: data.rateLimitSeconds,
      announcement: data.announcement,
      announcementEnabled: data.announcementEnabled,
    },
  });

  return ok({ setting });
});
