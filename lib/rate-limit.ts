const buckets = new Map<string, number>();

export function checkRateLimit(key: string, intervalMs = 30_000) {
  const now = Date.now();
  const last = buckets.get(key) ?? 0;
  if (now - last < intervalMs) {
    return { ok: false, retryAfterMs: intervalMs - (now - last) };
  }
  buckets.set(key, now);
  return { ok: true, retryAfterMs: 0 };
}

// 防重复提交：记录「IP + 内容指纹」最近一次提交时间。
const recentContent = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 5 * 60_000;

/** 轻量字符串 hash（djb2 变体），避免在内存里存完整留言内容。 */
function hashContent(value: string) {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

/**
 * 检测同一 IP 在时间窗口内是否重复提交了完全相同的内容。
 * 命中返回 ok:false（含剩余冷却）；否则记录指纹并返回 ok:true。
 * 内容用 trim 后归一，纯内存实现，重启失效。
 */
export function checkDuplicateContent(ip: string | null, content: string, windowMs = DUPLICATE_WINDOW_MS) {
  const now = Date.now();
  // 内存增长控制：条目过多时惰性清理已过期项。
  if (recentContent.size > 5000) {
    for (const [key, ts] of recentContent) {
      if (now - ts >= windowMs) recentContent.delete(key);
    }
  }
  const key = `${ip ?? "unknown"}:${hashContent(content.trim())}`;
  const last = recentContent.get(key) ?? 0;
  if (now - last < windowMs) {
    return { ok: false, retryAfterMs: windowMs - (now - last) };
  }
  recentContent.set(key, now);
  return { ok: true, retryAfterMs: 0 };
}
