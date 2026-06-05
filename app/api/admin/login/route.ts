import { NextResponse } from "next/server";
import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "登录信息无效" }, { status: 400 });
  }

  const admin = await verifyAdminCredentials(parsed.data.username, parsed.data.password);
  if (!admin) {
    return NextResponse.json({ error: "用户名或密码错误" }, { status: 401 });
  }

  await createAdminSession(admin.id);
  return NextResponse.json({ ok: true });
}
