import { Badge } from "@/components/ui/badge";

/**
 * 留言列表加载骨架屏。复用 MessageList 的外层面板 + 栅格布局，
 * 用 animate-pulse 占位，避免加载时只有一行文案的突兀感。
 */
export function MessageListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="sci-panel sci-border relative rounded-3xl border p-4 shadow-card backdrop-blur-sm md:p-5">
      <div className="pointer-events-none absolute inset-0 network-lines opacity-15" aria-hidden />
      <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge live>Signal Mesh</Badge>
          <h2 className="mt-3 font-heading text-xl font-semibold text-white md:text-2xl">神秘网络</h2>
        </div>
        <div className="h-8 w-24 animate-pulse rounded-full bg-white/5" aria-hidden />
      </div>
      <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="min-h-44 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03] p-5"
          >
            <div className="h-2 w-2 rounded-full bg-signal/40" />
            <div className="mt-5 h-2.5 w-20 rounded bg-white/10" />
            <div className="mt-3 h-4 w-28 rounded bg-white/15" />
            <div className="mt-5 space-y-2">
              <div className="h-3 w-full rounded bg-white/8" />
              <div className="h-3 w-11/12 rounded bg-white/8" />
              <div className="h-3 w-4/5 rounded bg-white/8" />
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="h-3 w-24 rounded bg-white/8" />
              <div className="h-7 w-14 rounded-full bg-white/8" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">正在加载留言…</span>
    </div>
  );
}
