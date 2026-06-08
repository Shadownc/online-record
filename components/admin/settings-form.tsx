"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Textarea } from "@/components/ui/textarea";
import { toDateTimeLocalValue } from "@/lib/utils";

type Setting = {
  messageEnabled: boolean;
  openStartTime: Date | string | null;
  openEndTime: Date | string | null;
  closedNotice: string;
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
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageEnabled,
          openStartTime: localToIso(openStartTime),
          openEndTime: localToIso(openEndTime),
          closedNotice,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "保存失败");
      setStatus("设置已保存");
      router.refresh();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "保存失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <label className="sci-panel flex items-center justify-between gap-4 rounded-2xl border border-white/10 p-5">
        <span>
          <span className="block font-heading text-base font-semibold text-white md:text-lg">开启留言</span>
          <span className="mt-1 block text-xs text-stardust">关闭后前台展示暂未开放动画，API 也会拒绝提交新信号。</span>
        </span>
        <input
          type="checkbox"
          checked={messageEnabled}
          onChange={(event) => setMessageEnabled(event.target.checked)}
          className="h-6 w-6 accent-signal"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <DateTimePicker label="开放开始时间" value={openStartTime} onChange={setOpenStartTime} />
        <DateTimePicker label="开放结束时间" value={openEndTime} onChange={setOpenEndTime} />
      </div>

      <label className="block space-y-2">
        <span className="font-mono text-xs uppercase tracking-widest text-stardust">关闭提示文案</span>
        <Textarea value={closedNotice} onChange={(event) => setClosedNotice(event.target.value)} maxLength={200} />
      </label>

      {status ? <p className="text-sm text-signal">{status}</p> : null}
      <Button type="submit" disabled={loading}>{loading ? "保存中..." : "保存设置"}</Button>
    </form>
  );
}
