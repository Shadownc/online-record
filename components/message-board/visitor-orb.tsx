import { Orbit, RadioTower, ShieldCheck, Zap } from "lucide-react";
import { GlassCard } from "@/components/ui/card";

export function VisitorOrb() {
  return (
    <div className="relative mx-auto h-[320px] w-full max-w-md md:h-[460px]">
      <div className="absolute inset-10 animate-spin rounded-full border border-signal/25 shadow-[0_0_60px_rgba(34,211,238,0.12)] [animation-duration:15s]" />
      <div className="absolute inset-20 animate-spin-reverse rounded-full border border-plasma/20" />
      <div className="absolute inset-0 rounded-full bg-signal/10 blur-[90px]" />
      <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-signal/50 bg-[#030712]/70 text-signal shadow-signal backdrop-blur-lg md:h-48 md:w-48">
        <Orbit className="h-20 w-20 md:h-28 md:w-28" aria-hidden />
      </div>
      <GlassCard className="absolute left-0 top-8 w-40 animate-bounce p-4 [animation-duration:4s]">
        <Zap className="mb-2 h-5 w-5 text-gold" aria-hidden />
        <p className="font-mono text-xs uppercase tracking-widest text-stardust">Live</p>
        <p className="font-heading text-lg font-semibold text-white">Emoji Signal</p>
      </GlassCard>
      <GlassCard className="absolute bottom-8 right-0 w-44 animate-bounce p-4 [animation-duration:5s]">
        <ShieldCheck className="mb-2 h-5 w-5 text-signal" aria-hidden />
        <p className="font-mono text-xs uppercase tracking-widest text-stardust">Trace</p>
        <p className="font-heading text-lg font-semibold text-white">IP Recorded</p>
      </GlassCard>
      <RadioTower className="absolute bottom-20 left-1/2 h-5 w-5 -translate-x-1/2 text-plasma" aria-hidden />
    </div>
  );
}
