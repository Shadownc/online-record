"use client";

import { useState } from "react";
import { ArrowUpRight, Heart, MessageSquare, Pause, Play, RadioTower, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiFetch } from "@/lib/api-client";
import { cn, formatDateTime } from "@/lib/utils";
import type { PublicMessage } from "@/components/message-board/message-form";

const signalSkins = [
  "border-signal/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(5,8,18,0.9)_58%)]",
  "border-plasma/30 bg-[linear-gradient(135deg,rgba(167,139,250,0.16),rgba(5,8,18,0.9)_58%)]",
  "border-cyan-300/30 bg-[linear-gradient(135deg,rgba(56,189,248,0.14),rgba(5,8,18,0.92)_60%)]",
  "border-gold/25 bg-[linear-gradient(135deg,rgba(251,191,36,0.1),rgba(5,8,18,0.92)_62%)]",
];

type MessageListProps = {
  messages: PublicMessage[];
  onRandomRefresh?: () => void;
  refreshing?: boolean;
  onReact?: (message: PublicMessage) => void;
  roaming?: boolean;
  onToggleRoam?: () => void;
};

export function MessageList({ messages, onRandomRefresh, refreshing = false, onReact, roaming = false, onToggleRoam }: MessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<PublicMessage | null>(null);

  async function toggleReaction(message: PublicMessage) {
    // 乐观更新：先翻转本地状态，失败再回滚。
    const optimistic = {
      ...message,
      reactedByMe: !message.reactedByMe,
      reactionCount: message.reactionCount + (message.reactedByMe ? -1 : 1),
    };
    onReact?.(optimistic);
    setSelectedMessage((current) => (current?.id === message.id ? optimistic : current));
    try {
      const data = await apiFetch<{ reacted: boolean; reactionCount: number }>(`/api/messages/${message.id}/react`, {
        method: "POST",
      });
      const synced = { ...message, reactedByMe: data.reacted, reactionCount: data.reactionCount };
      onReact?.(synced);
      setSelectedMessage((current) => (current?.id === message.id ? synced : current));
    } catch {
      onReact?.(message);
      setSelectedMessage((current) => (current?.id === message.id ? message : current));
    }
  }

  if (!messages.length) {
    return (
      <div className="sci-panel sci-border relative overflow-hidden rounded-3xl border border-dashed p-7 text-center shadow-card backdrop-blur-lg">
        <div className="absolute inset-0 network-lines opacity-20" aria-hidden />
        <RadioTower className="relative mx-auto h-7 w-7 text-signal" aria-hidden />
        <h2 className="relative mt-4 font-heading text-lg font-semibold text-white md:text-xl">信号网络正在等待第一个节点</h2>
        <p className="relative mt-2 text-sm text-stardust">点击“去留言”，把第一条心声发射到这片星际数据网络中。</p>
      </div>
    );
  }

  return (
    <div className="sci-panel sci-border relative rounded-3xl border p-4 shadow-card backdrop-blur-sm md:p-5">
      <div className="pointer-events-none absolute inset-0 network-lines opacity-15" aria-hidden />
      <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge live>Signal Mesh</Badge>
          <h2 className="mt-3 font-heading text-xl font-semibold text-white md:text-2xl">神秘网络</h2>
        </div>
        <div className="flex items-center gap-3">
          <p className="hidden font-mono text-xs uppercase tracking-widest text-stardust sm:block">{messages.length} nodes</p>
          {onToggleRoam ? (
            <Button
              type="button"
              variant={roaming ? "primary" : "outline"}
              size="sm"
              onClick={onToggleRoam}
              aria-pressed={roaming}
            >
              {roaming ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
              {roaming ? "停止漫游" : "漫游模式"}
            </Button>
          ) : null}
          {onRandomRefresh ? (
            <Button type="button" variant="outline" size="sm" onClick={onRandomRefresh} disabled={refreshing || roaming}>
              <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
              随机刷新
            </Button>
          ) : null}
        </div>
      </div>
      <div className="relative columns-1 gap-4 sm:columns-2 lg:columns-3">
        {messages.map((message, index) => {
          const skin = signalSkins[index % signalSkins.length];
          return (
            <article
              key={message.id}
              className={`group relative mb-4 flex break-inside-avoid flex-col overflow-hidden rounded-2xl border p-5 shadow-[0_18px_50px_-34px_rgba(34,211,238,0.72)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/55 hover:shadow-[0_0_38px_-14px_rgba(34,211,238,0.48)] ${skin}`}
            >
              <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-signal glow-node transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" aria-hidden />
              <div className="absolute right-5 top-5 h-px w-20 origin-right bg-gradient-to-l from-signal/45 to-transparent opacity-40 transition-opacity group-hover:opacity-80" aria-hidden />
              <div className="absolute bottom-5 left-5 h-px w-16 bg-gradient-to-r from-plasma/35 to-transparent opacity-30 transition-opacity group-hover:opacity-70" aria-hidden />
              <MessageSquare className="pointer-events-none absolute right-5 top-5 h-11 w-11 rotate-12 text-white/5 transition-colors group-hover:text-signal/10" aria-hidden />
              <div className="relative flex flex-1 flex-col pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Node #{String(messages.length - index).padStart(3, "0")}</p>
                    <h3 className="mt-2 font-heading text-base font-semibold text-white md:text-lg">{message.username}</h3>
                  </div>
                  <span className="rounded-full border border-signal/20 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal">●</span>
                </div>
                <div className="relative mt-4 overflow-hidden">
                  <p className="line-clamp-[12] whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">{message.content}</p>
                  {message.content.split('\n').length > 12 || message.content.length > 280 ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#050812] to-transparent" aria-hidden />
                  ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <div className="flex flex-col gap-1.5">
                    <time className="block font-mono text-[11px] text-stardust" dateTime={new Date(message.createdAt).toISOString()}>
                      {formatDateTime(message.createdAt)}
                    </time>
                    <button
                      type="button"
                      onClick={() => setSelectedMessage(message)}
                      className="inline-flex items-center gap-1 font-mono text-[11px] text-stardust transition hover:text-signal focus-ring"
                    >
                      查看全文
                      <ArrowUpRight className="h-3 w-3" aria-hidden />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleReaction(message)}
                    aria-pressed={message.reactedByMe}
                    aria-label={message.reactedByMe ? "取消共鸣" : "共鸣"}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-all duration-200 focus-ring",
                      message.reactedByMe
                        ? "border-plasma/50 bg-plasma/15 text-plasma"
                        : "border-white/15 bg-white/[0.03] text-stardust hover:border-plasma/40 hover:text-plasma",
                    )}
                  >
                    <Heart
                      className={cn("h-3.5 w-3.5 transition-transform duration-200", message.reactedByMe && "scale-110 fill-current")}
                      aria-hidden
                    />
                    {message.reactionCount}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <Modal
        open={Boolean(selectedMessage)}
        title={selectedMessage ? `${selectedMessage.username} 的留言全文` : "留言全文"}
        onClose={() => setSelectedMessage(null)}
        className="max-w-3xl"
      >
        {selectedMessage ? (
          <article className="space-y-5 pr-4">
            <div>
              <Badge live>Signal detail</Badge>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-signal">Node detail</p>
              <h3 className="mt-2 font-heading text-lg font-semibold text-white">{selectedMessage.username}</h3>
              <time className="mt-2 block font-mono text-xs text-stardust" dateTime={new Date(selectedMessage.createdAt).toISOString()}>
                {formatDateTime(selectedMessage.createdAt)}
              </time>
            </div>

            <ScrollArea className="max-h-[56vh]">
              <p className="whitespace-pre-wrap break-words pr-2 text-sm leading-relaxed text-white/90">
                {selectedMessage.content}
              </p>
            </ScrollArea>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => toggleReaction(selectedMessage)}
                aria-pressed={selectedMessage.reactedByMe}
                aria-label={selectedMessage.reactedByMe ? "取消共鸣" : "共鸣"}
                className={cn(
                  "inline-flex w-fit items-center gap-1.5 rounded-full border px-4 py-2 font-mono text-xs transition-all duration-200 focus-ring",
                  selectedMessage.reactedByMe
                    ? "border-plasma/50 bg-plasma/15 text-plasma"
                    : "border-white/15 bg-white/[0.03] text-stardust hover:border-plasma/40 hover:text-plasma",
                )}
              >
                <Heart className={cn("h-4 w-4 transition-transform duration-200", selectedMessage.reactedByMe && "scale-110 fill-current")} aria-hidden />
                {selectedMessage.reactionCount}
              </button>

              <a
                href={`/messages/${selectedMessage.id}`}
                className="inline-flex items-center gap-1 font-mono text-xs text-stardust transition hover:text-signal focus-ring"
              >
                打开独立详情页
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </article>
        ) : null}
      </Modal>
    </div>
  );
}
