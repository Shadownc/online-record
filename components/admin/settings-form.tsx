"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { useAsyncAction } from "@/lib/use-async-action";
import { toDateTimeLocalValue } from "@/lib/utils";

type Setting = {
  messageEnabled: boolean;
  openStartTime: Date | string | null;
  openEndTime: Date | string | null;
  closedNotice: string;
  usernameMaxLength: number;
  contentMaxLength: number;
  rateLimitSeconds: number;
  announcement: string;
  announcementEnabled: boolean;
};

function localToIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function SettingsForm({ setting }: { setting: Setting }) {
  const router = useRouter();
  const [messageEnabled, setMessageEnabled] = useState(setting.messageEnabled);
  const [openStartTime, setOpenStartTime] = useState(toDateTimeLocalValue(setting.openStartTime));
  const [openEndTime, setOpenEndTime] = useState(toDateTimeLocalValue(setting.openEndTime));
  const [closedNotice, setClosedNotice] = useState(setting.closedNotice);
  const [usernameMaxLength, setUsernameMaxLength] = useState(String(setting.usernameMaxLength));
  const [contentMaxLength, setContentMaxLength] = useState(String(setting.contentMaxLength));
  const [rateLimitSeconds, setRateLimitSeconds] = useState(String(setting.rateLimitSeconds));
  const [announcement, setAnnouncement] = useState(setting.announcement);
  const [announcementEnabled, setAnnouncementEnabled] = useState(setting.announcementEnabled);

  const save = useAsyncAction(
    () =>
      apiFetch("/api/admin/settings", {
        method: "PATCH",
        body: {
          messageEnabled,
          openStartTime: localToIso(openStartTime),
          openEndTime: localToIso(openEndTime),
          closedNotice,
          usernameMaxLength: Number(usernameMaxLength),
          contentMaxLength: Number(contentMaxLength),
          rateLimitSeconds: Number(rateLimitSeconds),
          announcement,
          announcementEnabled,
        },
      }),
    { successMessage: "设置已保存", onSuccess: () => router.refresh() },
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save.run();
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-4">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.04]">
          <span>
            <span className="block font-heading text-base font-semibold text-white">开启留言功能</span>
            <span className="mt-1 block text-sm text-stardust">关闭后前台展示暂未开放动画，API 也会拒绝提交新信号</span>
          </span>
          <input
            type="checkbox"
            checked={messageEnabled}
            onChange={(event) => setMessageEnabled(event.target.checked)}
            className="h-5 w-5 rounded accent-signal"
          />
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/[0.02] p-5 transition-colors hover:border-white/25 hover:bg-white/[0.04]">
          <span>
            <span className="block font-heading text-base font-semibold text-white">首页公告</span>
            <span className="mt-1 block text-sm text-stardust">开启后前台首页顶部展示滚动公告条</span>
          </span>
          <input
            type="checkbox"
            checked={announcementEnabled}
            onChange={(event) => setAnnouncementEnabled(event.target.checked)}
            className="h-5 w-5 rounded accent-signal"
          />
        </label>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <DateTimePicker label="开放开始时间" value={openStartTime} onChange={setOpenStartTime} />
        <DateTimePicker label="开放结束时间" value={openEndTime} onChange={setOpenEndTime} />
      </div>

      <label className="block space-y-2">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">关闭提示文案</span>
        <Textarea value={closedNotice} onChange={(event) => setClosedNotice(event.target.value)} maxLength={200} placeholder="例如：留言暂未开放，敬请期待" />
      </label>

      <label className="block space-y-2">
        <span className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">公告文案</span>
        <Textarea
          value={announcement}
          onChange={(event) => setAnnouncement(event.target.value)}
          maxLength={300}
          placeholder="例如：今晚 20:00-22:00 开放心声收集，欢迎留言 ✨"
        />
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="block space-y-2">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">用户名长度</span>
          <Input type="number" min={2} max={40} value={usernameMaxLength} onChange={(event) => setUsernameMaxLength(event.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">留言长度</span>
          <Input type="number" min={1} max={5000} value={contentMaxLength} onChange={(event) => setContentMaxLength(event.target.value)} />
        </label>
        <label className="block space-y-2">
          <span className="font-mono text-xs font-medium uppercase tracking-wider text-stardust">提交间隔（秒）</span>
          <Input type="number" min={0} max={3600} value={rateLimitSeconds} onChange={(event) => setRateLimitSeconds(event.target.value)} />
        </label>
      </div>
      <p className="text-xs leading-relaxed text-stardust">同一 IP + 用户名两次提交的最短间隔；设为 0 表示不限制。长度上限同时作用于前台输入框与后端校验。</p>

      {save.error ? <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{save.error}</p> : null}
      {save.status ? <p className="rounded-lg border border-signal/30 bg-signal/10 p-3 text-sm text-signal">{save.status}</p> : null}
      <Button type="submit" size="lg" disabled={save.loading} className="w-full sm:w-auto">{save.loading ? "保存中..." : "保存设置"}</Button>
    </form>
  );
}
