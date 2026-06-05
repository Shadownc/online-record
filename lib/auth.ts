import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "online-record-session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }
  return new TextEncoder().encode(secret);
}

export async function verifyAdminCredentials(username: string, password: string) {
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin) return null;
  const valid = await bcrypt.compare(password, admin.passwordHash);
  return valid ? admin : null;
}

export async function createAdminSession(adminId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const token = await new SignJWT({ adminId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const adminId = payload.adminId;
    if (typeof adminId !== "string") return null;
    return prisma.adminUser.findUnique({ where: { id: adminId } });
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
