"use client";

import { Megaphone } from "lucide-react";

/**
 * 首页滚动公告条。内容复制两份并整体左移 50%，实现无缝循环滚动。
 * 鼠标悬停时暂停（group-hover），方便阅读。
 */
export function AnnouncementBar({ text }: { text: string }) {
  const content = text.trim();
  if (!content) return null;

  return (
    <div className="sci-panel sci-border group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 shadow-card backdrop-blur-lg">
      <span className="relative z-10 inline-flex shrink-0 items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-signal">
        <Megaphone className="h-3.5 w-3.5" aria-hidden />
        公告
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
          <span className="px-4 text-sm text-white/90">{content}</span>
          <span className="px-4 text-sm text-white/90" aria-hidden>
            {content}
          </span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050a14] to-transparent" aria-hidden />
    </div>
  );
}
