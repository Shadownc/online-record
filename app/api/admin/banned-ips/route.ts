import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, parse, readJson, route } from "@/lib/api";
import { ipBanCreateSchema } from "@/lib/validators";

export const GET = route(async () => {
  await requireAdmin();

  const bannedIps = await prisma.bannedIp.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok({ bannedIps });
});

export const POST = route(async (request) => {
  await requireAdmin();

  const data = parse(ipBanCreateSchema, await readJson(request));

  const bannedIp = await prisma.bannedIp.upsert({
    where: { ip: data.ip },
    create: { ip: data.ip, reason: data.reason || null },
    update: { reason: data.reason || null },
  });

  return ok({ bannedIp }, 201);
});
