import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, parse, readJson, route } from "@/lib/api";
import { invalidateBlockedWordsCache } from "@/lib/blocked-words";
import { blockedWordUpdateSchema } from "@/lib/validators";

export const PATCH = route<{ params: { id: string } }>(async (request, { params }) => {
  await requireAdmin();
  const data = parse(blockedWordUpdateSchema, await readJson(request));

  const blockedWord = await prisma.blockedWord.update({
    where: { id: params.id },
    data: { action: data.action },
  });

  invalidateBlockedWordsCache();
  return ok({ blockedWord });
});

export const DELETE = route<{ params: { id: string } }>(async (_request, { params }) => {
  await requireAdmin();

  await prisma.blockedWord.delete({ where: { id: params.id } });

  invalidateBlockedWordsCache();
  return ok({ ok: true });
});
