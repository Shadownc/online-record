import { clearAdminSession } from "@/lib/auth";
import { ok, route } from "@/lib/api";

export const POST = route(async () => {
  await clearAdminSession();
  return ok({ ok: true });
});
