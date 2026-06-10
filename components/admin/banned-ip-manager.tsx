"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { useAsyncAction } from "@/lib/use-async-action";
import { formatDateTime } from "@/lib/utils";

type BannedIp = {
  id: string;
  ip: string;
  reason: string | null;
  createdAt: Date | string;
};

export function BannedIpManager({ bannedIps }: { bannedIps: BannedIp[] }) {
  const router = useRouter();
  const [ip, setIp] = useState("");
  const [reason, setReason] = useState("");

  const ban = useAsyncAction(
    () => apiFetch("/api/admin/banned-ips", { method: "POST", body: { ip, reason: reason || undefined } }),
    {
      successMessage: "IP 已封禁",
      onSuccess: () => {
        setIp("");
        setReason("");
        router.refresh();
      },
    },
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ban.run();
  }

  async function removeBan(id: string, targetIp: string) {
    if (!window.confirm(`确定解除 IP ${targetIp} 的封禁吗？`)) return;
    await apiFetch(`/api/admin/banned-ips/${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="sci-panel rounded-2xl border border-white/10 p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <label className="block space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-stardust">IP</span>
            <Input value={ip} onChange={(event) => setIp(event.target.value)} placeholder="例如 1.2.3.4" maxLength={64} required />
          </label>
          <label className="block space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-stardust">封禁原因</span>
            <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="可选" maxLength={255} />
          </label>
          <Button type="submit" disabled={ban.loading}>{ban.loading ? "封禁中..." : "封禁 IP"}</Button>
        </div>
        {ban.status ? <p className="mt-4 text-sm text-signal">{ban.status}</p> : null}
        {ban.error ? <p className="mt-4 text-sm text-red-300">{ban.error}</p> : null}
      </form>

      <div className="sci-panel overflow-hidden rounded-2xl border border-white/10 backdrop-blur-lg">
        {bannedIps.length ? (
          <table className="min-w-full divide-y divide-white/10 text-left text-xs">
            <thead className="bg-white/[0.03] font-mono text-xs uppercase tracking-widest text-stardust">
              <tr>
                <th className="px-5 py-4">IP</th>
                <th className="px-5 py-4">原因</th>
                <th className="px-5 py-4">封禁时间</th>
                <th className="px-5 py-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {bannedIps.map((item) => (
                <tr key={item.id} className="align-top transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-mono text-white">{item.ip}</td>
                  <td className="px-5 py-4 text-stardust">{item.reason || "-"}</td>
                  <td className="px-5 py-4 font-mono text-xs text-stardust">{formatDateTime(item.createdAt)}</td>
                  <td className="px-5 py-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => removeBan(item.id, item.ip)}>
                      解除封禁
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-center text-stardust">暂无封禁 IP。</p>
        )}
      </div>
    </div>
  );
}
