import { AdminShell } from "@/components/admin/admin-shell";
import { PageHeader } from "@/components/admin/page-header";
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
      <div className="space-y-6">
        <PageHeader
          badge="System Config"
          title="系统设置"
          description="控制留言开放状态、时间段、字数限制和公告内容。"
        />
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <Badge live={openNow} className={openNow ? undefined : "border-red-400/40 bg-red-500/10 text-red-200"}>
              {openNow ? "Accepting signals" : "Network paused"}
            </Badge>
            <h2 className="mt-4 font-heading text-xl font-semibold text-white">当前状态</h2>
            <p className="mt-3 text-sm leading-relaxed text-stardust">
              {openNow ? "留言功能已开放，用户可以发送新信号。" : "留言功能已暂停，前台会展示暂未开放状态。"}
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <p className="font-mono text-xs uppercase tracking-wider text-stardust">关闭提示语</p>
                <p className="mt-2 text-sm leading-relaxed text-white">{setting.closedNotice}</p>
              </div>
              {setting.announcement && (
                <div className="rounded-xl border border-signal/20 bg-signal/5 p-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-signal">公告内容</p>
                  <p className="mt-2 text-sm leading-relaxed text-white">{setting.announcement}</p>
                </div>
              )}
            </div>
          </Card>
          <Card>
            <SettingsForm setting={setting} />
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
