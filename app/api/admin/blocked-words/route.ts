import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiError, ok, parse, readJson, route } from "@/lib/api";
import { invalidateBlockedWordsCache } from "@/lib/blocked-words";
import { blockedWordCreateSchema } from "@/lib/validators";

export const GET = route(async () => {
  await requireAdmin();

  const blockedWords = await prisma.blockedWord.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return ok({ blockedWords });
});

export const POST = route(async (request) => {
  await requireAdmin();

  const data = parse(blockedWordCreateSchema, await readJson(request));

  const blockedWord = await prisma.blockedWord
    .create({ data: { word: data.word, action: data.action } })
    .catch((error) => {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new ApiError("该敏感词已存在。", 409);
      }
      throw error;
    });

  invalidateBlockedWordsCache();
  return ok({ blockedWord }, 201);
});
