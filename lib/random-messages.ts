import { prisma } from "@/lib/prisma";

/**
 * 高效随机取一批可见留言的 id。
 *
 * 为什么不用 `ORDER BY RAND()`：MySQL 会给全表每行生成随机数再整表排序，
 * 数据量大时（数万+）开销随表线性增长，明显变慢。
 *
 * 优化：先用概率闸门 `RAND() < 阈值` 在扫描阶段廉价筛掉大部分行，
 * 只让约 `take * OVERSAMPLE` 条幸存，再对这一小批 `ORDER BY RAND()` 取前 take 条。
 * 排序的数据量从「全表」降到「一小撮」。
 *
 * - total 很小时阈值会到 1，退化为对全表随机排序（结果与原行为一致，仍正确）。
 * - 概率抽样存在波动，OVERSAMPLE 倍数留足冗余，正常情况下足够取满 take。
 */
const OVERSAMPLE = 3;

export async function pickRandomMessageIds(take: number, total: number): Promise<string[]> {
  if (total <= 0 || take <= 0) return [];

  // 阈值上限 1：当 take*OVERSAMPLE >= total 时等于不过滤，直接全量参与随机。
  const threshold = Math.min(1, (take * OVERSAMPLE) / total);

  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM Message
    WHERE visible = true AND deletedAt IS NULL AND RAND() < ${threshold}
    ORDER BY RAND()
    LIMIT ${take}
  `;
  return rows.map((row) => row.id);
}
