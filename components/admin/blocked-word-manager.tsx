"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { apiFetch } from "@/lib/api-client";
import { useAsyncAction } from "@/lib/use-async-action";
import { formatDateTime } from "@/lib/utils";

type BlockAction = "reject" | "hide";

type BlockedWord = {
  id: string;
  word: string;
  action: string;
  createdAt: Date | string;
};

const actionLabel: Record<BlockAction, string> = {
  reject: "拒绝发布",
  hide: "进待审核",
};

export function BlockedWordManager({ blockedWords }: { blockedWords: BlockedWord[] }) {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [action, setAction] = useState<BlockAction>("reject");

  const add = useAsyncAction(
    () => apiFetch("/api/admin/blocked-words", { method: "POST", body: { word, action } }),
    {
      successMessage: "敏感词已添加",
      onSuccess: () => {
        setWord("");
        setAction("reject");
        router.refresh();
      },
    },
  );

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void add.run();
  }

  async function toggleAction(id: string, current: BlockAction) {
    const next: BlockAction = current === "reject" ? "hide" : "reject";
    await apiFetch(`/api/admin/blocked-words/${id}`, { method: "PATCH", body: { action: next } }).catch(() => null);
    router.refresh();
  }

  async function remove(id: string, target: string) {
    if (!window.confirm(`确定删除敏感词「${target}」吗？`)) return;
    await apiFetch(`/api/admin/blocked-words/${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="sci-panel rounded-2xl border border-white/10 p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-end">
          <label className="block space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-stardust">敏感词</span>
            <Input value={word} onChange={(event) => setWord(event.target.value)} placeholder="例如 广告词" maxLength={100} required />
          </label>
          <label className="block space-y-2">
            <span className="font-mono text-xs uppercase tracking-widest text-stardust">处理方式</span>
            <CustomSelect
              value={action}
              onChange={(value) => setAction(value as BlockAction)}
              options={[
                { label: "拒绝发布", value: "reject" },
                { label: "进待审核（隐藏）", value: "hide" },
              ]}
            />
          </label>
          <Button type="submit" disabled={add.loading}>{add.loading ? "添加中..." : "添加敏感词"}</Button>
        </div>
        {add.status ? <p className="mt-4 text-sm text-signal">{add.status}</p> : null}
        {add.error ? <p className="mt-4 text-sm text-red-300">{add.error}</p> : null}
        <p className="mt-4 text-xs text-stardust">
          匹配时忽略大小写与空格。<span className="text-white/70">拒绝发布</span>：命中即拒绝；<span className="text-white/70">进待审核</span>：照常入库但前台不可见，可在留言列表恢复。
        </p>
      </form>

      <div className="sci-panel overflow-hidden rounded-2xl border border-white/10 backdrop-blur-lg">
        {blockedWords.length ? (
          <table className="min-w-full divide-y divide-white/10 text-left text-xs">
            <thead className="bg-white/[0.03] font-mono text-xs uppercase tracking-widest text-stardust">
              <tr>
                <th className="px-5 py-4">敏感词</th>
                <th className="px-5 py-4">处理方式</th>
                <th className="px-5 py-4">添加时间</th>
                <th className="px-5 py-4">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {blockedWords.map((item) => {
                const itemAction: BlockAction = item.action === "hide" ? "hide" : "reject";
                return (
                  <tr key={item.id} className="align-top transition-colors hover:bg-white/[0.03]">
                    <td className="px-5 py-4 font-mono text-white">{item.word}</td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          itemAction === "reject"
                            ? "inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-red-400/10 px-2.5 py-1 font-mono text-[11px] text-red-300"
                            : "inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 font-mono text-[11px] text-gold"
                        }
                      >
                        {itemAction === "reject" ? <ShieldAlert className="h-3.5 w-3.5" /> : <ShieldOff className="h-3.5 w-3.5" />}
                        {actionLabel[itemAction]}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-stardust">{formatDateTime(item.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => toggleAction(item.id, itemAction)}>
                          切换为{itemAction === "reject" ? "待审核" : "拒绝"}
                        </Button>
                        <Button type="button" variant="danger" size="sm" onClick={() => remove(item.id, item.word)}>
                          <Trash2 className="h-4 w-4" />
                          删除
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="p-8 text-center text-stardust">暂无敏感词。</p>
        )}
      </div>
    </div>
  );
}
