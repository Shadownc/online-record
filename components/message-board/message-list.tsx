import { MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { PublicMessage } from "@/components/message-board/message-form";

const noteSkins = [
  "border-bitcoin/35 bg-[linear-gradient(135deg,rgba(247,147,26,0.22),rgba(15,17,21,0.88)_58%)] rotate-[-1.25deg]",
  "border-gold/30 bg-[linear-gradient(135deg,rgba(255,214,0,0.16),rgba(15,17,21,0.9)_58%)] rotate-[1deg]",
  "border-burnt/35 bg-[linear-gradient(135deg,rgba(234,88,12,0.18),rgba(15,17,21,0.9)_60%)] rotate-[0.5deg]",
  "border-white/15 bg-[linear-gradient(135deg,rgba(148,163,184,0.12),rgba(15,17,21,0.92)_62%)] rotate-[-0.6deg]",
];

export function MessageList({ messages }: { messages: PublicMessage[] }) {
  if (!messages.length) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-dashed border-bitcoin/35 bg-black/35 p-7 text-center shadow-card backdrop-blur-lg">
        <div className="absolute inset-0 bg-grid-pattern opacity-25" aria-hidden />
        <Sparkles className="relative mx-auto h-7 w-7 text-bitcoin" aria-hidden />
        <h2 className="relative mt-4 font-heading text-lg font-semibold text-white md:text-xl">许愿墙还在等待第一张便利贴</h2>
        <p className="relative mt-2 text-sm text-stardust">点击“去留言”，把第一条愿望贴到数字黄金留言墙上。</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/25 p-4 shadow-card backdrop-blur-sm md:p-5">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" aria-hidden />
      <div className="relative mb-5 flex items-center justify-between gap-4">
        <div>
          <Badge live>Show Time</Badge>
          <h2 className="mt-3 font-heading text-xl font-semibold text-white md:text-2xl">链上许愿墙</h2>
        </div>
        <p className="hidden font-mono text-xs uppercase tracking-widest text-stardust sm:block">{messages.length} notes</p>
      </div>
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {messages.map((message, index) => {
          const skin = noteSkins[index % noteSkins.length];
          return (
            <article
              key={message.id}
              className={`group relative min-h-44 overflow-hidden rounded-2xl border p-5 shadow-[0_18px_50px_-32px_rgba(247,147,26,0.65)] transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:border-bitcoin/55 hover:shadow-[0_0_38px_-14px_rgba(247,147,26,0.45)] ${skin}`}
            >
              <div className="absolute left-1/2 top-3 h-3 w-20 -translate-x-1/2 rounded-full bg-white/10 shadow-[0_0_18px_rgba(255,255,255,0.08)]" aria-hidden />
              <MessageSquare className="absolute -right-4 -top-4 h-20 w-20 rotate-12 text-white/5 transition-colors group-hover:text-bitcoin/10" aria-hidden />
              <div className="relative pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-bitcoin">Wish #{String(messages.length - index).padStart(3, "0")}</p>
                    <h3 className="mt-2 font-heading text-base font-semibold text-white md:text-lg">{message.username}</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 font-mono text-[10px] text-stardust">₿</span>
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
