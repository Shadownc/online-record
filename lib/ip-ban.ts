import { prisma } from "@/lib/prisma";

export async function getBannedIp(ip: string | null | undefined) {
  if (!ip) return null;
  return prisma.bannedIp.findUnique({ where: { ip } });
}

export async function isIpBanned(ip: string | null | undefined) {
  const bannedIp = await getBannedIp(ip);
  return Boolean(bannedIp);
}
