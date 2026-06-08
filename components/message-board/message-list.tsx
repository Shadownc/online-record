import { MessageSquare, RadioTower, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
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
};

export function MessageList({ messages, onRandomRefresh, refreshing = false }: MessageListProps) {
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
          {onRandomRefresh ? (
            <Button type="button" variant="outline" size="sm" onClick={onRandomRefresh} disabled={refreshing}>
              <RefreshCw className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden />
              随机刷新
            </Button>
          ) : null}
        </div>
      </div>
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {messages.map((message, index) => {
          const skin = signalSkins[index % signalSkins.length];
          return (
            <article
              key={message.id}
              className={`group relative min-h-44 overflow-hidden rounded-2xl border p-5 shadow-[0_18px_50px_-34px_rgba(34,211,238,0.72)] transition-all duration-300 hover:-translate-y-1 hover:border-signal/55 hover:shadow-[0_0_38px_-14px_rgba(34,211,238,0.48)] ${skin}`}
            >
              <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-signal glow-node transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1" aria-hidden />
              <div className="absolute right-5 top-5 h-px w-20 origin-right bg-gradient-to-l from-signal/45 to-transparent opacity-40 transition-opacity group-hover:opacity-80" aria-hidden />
              <div className="absolute bottom-5 left-5 h-px w-16 bg-gradient-to-r from-plasma/35 to-transparent opacity-30 transition-opacity group-hover:opacity-70" aria-hidden />
              <MessageSquare className="pointer-events-none absolute right-5 top-5 h-11 w-11 rotate-12 text-white/5 transition-colors group-hover:text-signal/10" aria-hidden />
              <div className="relative pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Node #{String(messages.length - index).padStart(3, "0")}</p>
                    <h3 className="mt-2 font-heading text-base font-semibold text-white md:text-lg">{message.username}</h3>
                  </div>
                  <span className="rounded-full border border-signal/20 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal">●</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">{message.content}</p>
                <time className="mt-5 block font-mono text-[11px] text-stardust" dateTime={new Date(message.createdAt).toISOString()}>
                  {formatDateTime(message.createdAt)}
                </time>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
