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
