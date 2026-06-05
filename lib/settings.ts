import { prisma } from "@/lib/prisma";

export async function getSiteSetting() {
  return prisma.siteSetting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton" },
    update: {},
  });
}

export function isMessageOpen(setting: {
  messageEnabled: boolean;
  openStartTime: Date | null;
  openEndTime: Date | null;
}) {
  if (!setting.messageEnabled) return false;
  const now = new Date();
  if (setting.openStartTime && now < setting.openStartTime) return false;
  if (setting.openEndTime && now > setting.openEndTime) return false;
  return true;
}
