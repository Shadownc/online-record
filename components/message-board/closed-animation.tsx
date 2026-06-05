import { LockKeyhole, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/card";

export function ClosedAnimation({ notice }: { notice: string }) {
  return (
    <GlassCard className="relative overflow-hidden p-8 text-center">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" aria-hidden />
      <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-bitcoin/10 blur-[90px]" aria-hidden />
      <div className="relative mx-auto flex h-64 w-64 animate-float items-center justify-center">
        <div className="absolute inset-4 animate-spin rounded-full border border-bitcoin/30 shadow-[0_0_30px_rgba(247,147,26,0.2)]" />
        <div className="absolute inset-10 animate-spin-reverse rounded-full border border-gold/20" />
        <div className="absolute inset-16 rounded-full border border-white/10" />
        <div className="relative rounded-3xl border border-bitcoin/50 bg-black/60 p-8 text-bitcoin shadow-orange backdrop-blur-lg">
          <LockKeyhole className="h-16 w-16" aria-hidden />
        </div>
      </div>
      <div className="relative -mt-4 space-y-4">
        <Badge live className="border-gold/40 bg-gold/10 text-gold">Network paused</Badge>
        <h2 className="font-heading text-3xl font-bold text-white md:text-5xl">留言窗口暂未开放</h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-stardust md:text-lg">{notice}</p>
        <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-mono text-xs uppercase tracking-widest text-stardust">
          <RadioTower className="h-4 w-4 text-bitcoin" aria-hidden />
          Awaiting next valid time block
        </div>
      </div>
    </GlassCard>
  );
}
