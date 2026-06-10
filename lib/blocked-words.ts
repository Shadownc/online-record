import { prisma } from "@/lib/prisma";

export type BlockAction = "reject" | "hide";

export type BlockedWordMatch = {
  /** 命中的词（库中存的原文）。 */
  word: string;
  /** 该词配置的处理方式。 */
  action: BlockAction;
};

type CacheEntry = {
  words: { word: string; normalized: string; action: BlockAction }[];
  loadedAt: number;
};

const CACHE_TTL_MS = 30_000;
let cache: CacheEntry | null = null;

/** 归一化：转小写、去除所有空白，便于绕过空格/大小写的匹配。 */
function normalize(value: string) {
  return value.toLowerCase().replace(/\s+/g, "");
}

function isBlockAction(value: string): value is BlockAction {
  return value === "reject" || value === "hide";
}

async function loadWords() {
  if (cache && Date.now() - cache.loadedAt < CACHE_TTL_MS) {
    return cache.words;
  }
  const rows = await prisma.blockedWord.findMany({ select: { word: true, action: true } });
  const words = rows
    .map((row) => ({
      word: row.word,
      normalized: normalize(row.word),
      action: isBlockAction(row.action) ? row.action : "reject",
    }))
    .filter((row) => row.normalized.length > 0);
  cache = { words, loadedAt: Date.now() };
  return words;
}

/** 词库变更后调用，使缓存立即失效。 */
export function invalidateBlockedWordsCache() {
  cache = null;
}

/**
 * 检测内容是否命中敏感词。返回所有命中项；未命中返回空数组。
 * 命中优先级：只要有任意 reject 命中，调用方应直接拒绝；
 * 否则若有 hide 命中，则入库后隐藏。
 */
export async function matchBlockedWords(content: string): Promise<BlockedWordMatch[]> {
  const words = await loadWords();
  if (!words.length) return [];

  const normalizedContent = normalize(content);
  const matches: BlockedWordMatch[] = [];
  for (const entry of words) {
    if (normalizedContent.includes(entry.normalized)) {
      matches.push({ word: entry.word, action: entry.action });
    }
  }
  return matches;
}

/**
 * 汇总命中结果，给出最终处理决定：
 * - blocked: true  → 含 reject 命中，应拒绝发布
 * - hidden: true   → 仅 hide 命中，入库但 visible=false
 * - 都为 false     → 未命中，正常发布
 */
export function resolveBlockDecision(matches: BlockedWordMatch[]) {
  const hasReject = matches.some((m) => m.action === "reject");
  const hasHide = matches.some((m) => m.action === "hide");
  return {
    blocked: hasReject,
    hidden: !hasReject && hasHide,
    matches,
  };
}
