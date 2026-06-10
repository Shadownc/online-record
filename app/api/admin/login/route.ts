import { createAdminSession, verifyAdminCredentials } from "@/lib/auth";
import { ok, parse, readJson, route, ApiError } from "@/lib/api";
import { loginSchema } from "@/lib/validators";

export const POST = route(async (request) => {
  const data = parse(loginSchema, await readJson(request));

  const admin = await verifyAdminCredentials(data.username, data.password);
  if (!admin) {
    throw new ApiError("用户名或密码错误", 401);
  }

  await createAdminSession(admin.id);
  return ok({ ok: true });
});
