import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-6 text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-40" aria-hidden />
      <div className="absolute h-96 w-96 rounded-full bg-bitcoin/10 blur-[130px]" aria-hidden />
      <section className="relative w-full max-w-md rounded-2xl border border-white/10 bg-black/50 p-8 shadow-card backdrop-blur-lg">
        <Badge live>Secure admin access</Badge>
        <h1 className="mt-5 font-heading text-3xl font-bold text-white">后台登录</h1>
        <p className="mt-3 text-sm leading-relaxed text-stardust">使用种子脚本创建的管理员账号进入留言管理控制台。</p>
        <LoginForm />
      </section>
    </main>
  );
}
