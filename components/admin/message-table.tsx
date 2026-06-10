"use client";

import { useState } from "react";
import { Ban, Eye, EyeOff, MessageSquare, MoreVertical, RotateCcw, Trash2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api-client";
import { formatDateTime } from "@/lib/utils";

type Message = {
  id: string;
  username: string;
  content: string;
  ip: string | null;
  userAgent: string | null;
  visible: boolean;
  createdAt: Date | string;
};

type BulkAction = "hide" | "show" | "delete" | "restore" | "purge";

export function MessageTable({ messages, deleted = false }: { messages: Message[]; deleted?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allSelected = messages.length > 0 && messages.every((message) => selected.has(message.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(messages.map((message) => message.id)));
  }

  async function updateMessage(id: string, body: Record<string, unknown>) {
    await apiFetch(`/api/admin/messages/${id}`, { method: "PATCH", body }).catch(() => null);
    router.refresh();
  }

  async function purgeMessage(id: string) {
    if (!window.confirm("确定永久删除这条留言吗？此操作不可恢复。")) return;
    await apiFetch(`/api/admin/messages/${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }

  async function banIp(ip: string | null) {
    if (!ip) return;
    if (!window.confirm(`确定封禁 IP ${ip} 吗？封禁后该 IP 将无法访问留言区或继续留言。`)) return;

    await apiFetch("/api/admin/banned-ips", {
      method: "POST",
      body: { ip, reason: "后台从留言列表封禁" },
    }).catch(() => null);
    router.refresh();
  }

  async function bulkDelete(body: { ip: string } | { username: string }, label: string) {
    if (!window.confirm(`确定删除${label}的全部留言吗？该操作会软删除所有匹配留言。`)) return;

    await apiFetch("/api/admin/messages", { method: "DELETE", body }).catch(() => null);
    router.refresh();
  }

  async function runBulk(action: BulkAction, confirmText?: string) {
    const ids = [...selected];
    if (!ids.length) return;
    if (confirmText && !window.confirm(confirmText)) return;

    setBulkRunning(true);
    await apiFetch("/api/admin/messages/bulk", { method: "POST", body: { ids, action } }).catch(() => null);
    setBulkRunning(false);
    setSelected(new Set());
    router.refresh();
  }

  if (!messages.length) {
    return (
      <div className="sci-panel flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-12 text-center backdrop-blur-lg">
        <MessageSquare className="h-12 w-12 text-stardust/50" aria-hidden />
        <p className="mt-4 font-heading text-lg font-semibold text-white">
          {deleted ? "回收站为空" : "暂无留言"}
        </p>
        <p className="mt-2 text-sm text-stardust">
          {deleted ? "所有留言都已恢复或永久删除" : "还没有用户留言，等待第一条信号节点"}
        </p>
      </div>
    );
  }

  const selectedCount = selected.size;

  return (
    <div className="space-y-4">
      {selectedCount > 0 ? (
        <div className="sci-panel flex flex-col gap-3 rounded-xl border border-signal/40 bg-signal/8 p-4 backdrop-blur-lg sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-sm font-medium uppercase tracking-wider text-signal">已选中 {selectedCount} 条留言</p>
          <div className="flex flex-wrap gap-2">
            {deleted ? (
              <>
                <Button type="button" variant="outline" size="sm" disabled={bulkRunning} onClick={() => runBulk("restore")}>
                  <RotateCcw className="h-4 w-4" />
                  批量恢复
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={bulkRunning}
                  onClick={() => runBulk("purge", `确定永久删除选中的 ${selectedCount} 条留言吗？此操作不可恢复。`)}
                >
                  <XCircle className="h-4 w-4" />
                  永久删除
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" size="sm" disabled={bulkRunning} onClick={() => runBulk("hide")}>
                  <EyeOff className="h-4 w-4" />
                  批量隐藏
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={bulkRunning} onClick={() => runBulk("show")}>
                  <Eye className="h-4 w-4" />
                  批量显示
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  disabled={bulkRunning}
                  onClick={() => runBulk("delete", `确定删除选中的 ${selectedCount} 条留言吗？将移入回收站。`)}
                >
                  <Trash2 className="h-4 w-4" />
                  批量删除
                </Button>
              </>
            )}
            <Button type="button" variant="ghost" size="sm" disabled={bulkRunning} onClick={() => setSelected(new Set())}>
              取消
            </Button>
          </div>
        </div>
      ) : null}

      <div className="sci-panel rounded-2xl border border-white/10 backdrop-blur-lg">
        <div className="overflow-x-auto">
          <table className="relative min-w-full divide-y divide-white/10 text-left text-sm">
            <thead className="sticky top-0 z-10 bg-white/[0.04] font-mono text-xs uppercase tracking-wider text-stardust backdrop-blur-md">
              <tr>
                <th className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="全选"
                    className="h-4 w-4 rounded accent-signal"
                  />
                </th>
                <th className="px-6 py-4">用户</th>
                <th className="px-6 py-4">留言内容</th>
                <th className="px-6 py-4">IP / UA</th>
                <th className="px-6 py-4">创建时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {messages.map((message) => (
                <tr key={message.id} className="align-top transition-colors hover:bg-white/[0.04]">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(message.id)}
                      onChange={() => toggle(message.id)}
                      aria-label={`选择 ${message.username} 的留言`}
                      className="h-4 w-4 rounded accent-signal"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-heading text-sm font-semibold text-white">{message.username}</p>
                    <span className={message.visible ? "mt-1.5 inline-flex items-center gap-1 rounded-full border border-signal/30 bg-signal/10 px-2 py-0.5 font-mono text-[10px] text-signal" : "mt-1.5 inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] text-red-300"}>
                      <span className={message.visible ? "h-1 w-1 rounded-full bg-signal" : "h-1 w-1 rounded-full bg-red-400"} />
                      {message.visible ? "可见" : "隐藏"}
                    </span>
                  </td>
                  <td className="max-w-md px-6 py-4 text-stardust">
                    <p className="line-clamp-3 whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                  </td>
                  <td className="max-w-xs px-6 py-4 font-mono text-xs text-stardust">
                    <p className="text-white/80">{message.ip ?? "unknown"}</p>
                    <p className="mt-2 line-clamp-2 text-white/40">{message.userAgent ?? "unknown user-agent"}</p>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-stardust">{formatDateTime(message.createdAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {/* PC端显示主要按钮 */}
                      {deleted ? (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => updateMessage(message.id, { restore: true })} className="hidden sm:inline-flex">
                            <RotateCcw className="h-4 w-4" />
                            恢复
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => purgeMessage(message.id)} className="hidden sm:inline-flex">
                            <XCircle className="h-4 w-4" />
                            永久删除
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => updateMessage(message.id, { visible: !message.visible })} className="hidden sm:inline-flex">
                            {message.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            <span className="hidden lg:inline">{message.visible ? "隐藏" : "显示"}</span>
                          </Button>
                          <Button type="button" variant="danger" size="sm" onClick={() => updateMessage(message.id, { deleted: true })} className="hidden sm:inline-flex">
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden lg:inline">删除</span>
                          </Button>
                        </>
                      )}

                      {/* 移动端和更多操作按钮 */}
                      <div className="relative">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setMenuOpen(menuOpen === message.id ? null : message.id)}
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>

                        {menuOpen === message.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-white/20 bg-[#050812] py-1 shadow-lg">
                              {deleted ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => { updateMessage(message.id, { restore: true }); setMenuOpen(null); }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                    恢复留言
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { purgeMessage(message.id); setMenuOpen(null); }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    永久删除
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => { updateMessage(message.id, { visible: !message.visible }); setMenuOpen(null); }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5 sm:hidden"
                                  >
                                    {message.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    {message.visible ? "隐藏留言" : "显示留言"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => { updateMessage(message.id, { deleted: true }); setMenuOpen(null); }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10 sm:hidden"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    删除留言
                                  </button>
                                  {message.ip ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => { banIp(message.ip); setMenuOpen(null); }}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-300 hover:bg-red-500/10"
                                      >
                                        <Ban className="h-4 w-4" />
                                        封禁 IP
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => { bulkDelete({ ip: message.ip! }, ` IP ${message.ip}`); setMenuOpen(null); }}
                                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        删除此 IP 全部
                                      </button>
                                    </>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => { bulkDelete({ username: message.username }, `用户 ${message.username}`); setMenuOpen(null); }}
                                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-white hover:bg-white/5"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    删除此用户全部
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
