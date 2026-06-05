import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/login-form";
import { Badge } from "@/components/ui/badge";
import { SciFiBackground } from "@/components/ui/sci-fi-background";

export default async function LoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-void px-6 text-white">
      <SciFiBackground variant="login" density="medium" />
      <section className="sci-panel sci-border relative z-10 w-full max-w-md rounded-2xl border p-8 shadow-card backdrop-blur-xl">
        <Badge live>Secure admin node</Badge>
        <h1 className="mt-5 font-heading text-3xl font-bold text-white">后台登录</h1>
        <p className="mt-3 text-sm leading-relaxed text-stardust">使用种子脚本创建的管理员账号接入留言管理节点。</p>
        <LoginForm />
      </section>
    </main>
  );
}
