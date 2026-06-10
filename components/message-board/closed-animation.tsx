import { LockKeyhole, RadioTower } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/card";
import { Countdown } from "@/components/message-board/countdown";

export function ClosedAnimation({
  notice,
  openStartTime,
  onCountdownComplete,
}: {
  notice: string;
  openStartTime?: string | Date | null;
  onCountdownComplete?: () => void;
}) {
  // 仅当开放开始时间在未来时，展示「距离开放」倒计时。
  const startsInFuture = openStartTime ? new Date(openStartTime).getTime() > Date.now() : false;
  return (
    <GlassCard className="relative overflow-hidden p-7 text-center">
      <div className="absolute inset-0 network-lines opacity-20" aria-hidden />
      <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-signal/10 blur-[90px]" aria-hidden />
      <div className="relative mx-auto flex h-56 w-56 animate-float items-center justify-center">
        <div className="absolute inset-4 animate-spin rounded-full border border-signal/25 shadow-[0_0_30px_rgba(34,211,238,0.18)] [animation-duration:15s]" />
        <div className="absolute inset-10 animate-spin-reverse rounded-full border border-plasma/20" />
        <div className="absolute inset-16 rounded-full border border-white/10" />
        <span className="absolute right-12 top-12 h-2 w-2 rounded-full bg-signal glow-node" />
        <span className="absolute bottom-14 left-12 h-1.5 w-1.5 rounded-full bg-plasma glow-node" />
        <div className="relative rounded-3xl border border-signal/45 bg-[#030712]/70 p-7 text-signal shadow-signal backdrop-blur-lg">
          <LockKeyhole className="h-12 w-12" aria-hidden />
        </div>
      </div>
      <div className="relative -mt-3 space-y-4">
        <Badge live className="border-plasma/40 bg-plasma/10 text-plasma">Network paused</Badge>
        <h2 className="font-heading text-2xl font-bold text-white md:text-4xl">留言窗口暂未开放</h2>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-stardust md:text-base">{notice}</p>
        {startsInFuture ? (
          <Countdown
            target={openStartTime!}
            label="距离开放还有"
            onComplete={onCountdownComplete}
          />
        ) : (
          <div className="mx-auto flex max-w-sm items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-stardust">
            <RadioTower className="h-4 w-4 text-signal" aria-hidden />
            Awaiting next signal window
          </div>
        )}
      </div>
    </GlassCard>
  );
}
