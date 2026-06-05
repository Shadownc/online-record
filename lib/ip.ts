import { headers } from "next/headers";

export async function getRequestIp() {
  const h = await headers();
  const cfIp = h.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  const realIp = h.get("x-real-ip");
  if (realIp) return realIp;

  const forwardedFor = h.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;

  return null;
}

export async function getUserAgent() {
  const h = await headers();
  return h.get("user-agent");
}
