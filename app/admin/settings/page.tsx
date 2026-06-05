import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsForm } from "@/components/admin/settings-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getSiteSetting, isMessageOpen } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  const setting = await getSiteSetting();
  const openNow = isMessageOpen(setting);

  return (
    <AdminShell>
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <Card className="holographic-gradient">
          <Badge live={openNow} className={openNow ? undefined : "border-red-400/40 bg-red-500/10 text-red-200"}>
            {openNow ? "Accepting blocks" : "Network paused"}
          </Badge>
          <h2 className="mt-4 font-heading text-3xl font-bold text-white">留言开放设置</h2>
          <p className="mt-3 leading-relaxed text-stardust">
            这里控制前台留言窗口。关闭或超出时间段时，前台会展示带轨道动画的暂未开放状态，并且服务端 API 会拒绝新留言。
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="font-mono text-xs uppercase tracking-widest text-stardust">Current notice</p>
            <p className="mt-3 text-white">{setting.closedNotice}</p>
          </div>
        </Card>
        <Card>
          <SettingsForm setting={setting} />
        </Card>
      </div>
    </AdminShell>
  );
}
