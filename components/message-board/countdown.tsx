"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

/** 把毫秒差拆成天/时/分/秒，便于分段展示。 */
function breakdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total <= 0,
  };
}

/**
 * 倒计时组件。target 为目标时刻，每秒刷新。
 * 为避免 SSR/CSR 时间不一致导致的 hydration mismatch，
 * 挂载后才开始计算，首帧只渲染 label 与占位。
 * 倒计时归零时调用 onComplete（供父级刷新开放状态）。
 */
export function Countdown({
  target,
  label,
  onComplete,
}: {
  target: string | Date;
  label: string;
  onComplete?: () => void;
}) {
  const targetMs = new Date(target).getTime();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(targetMs)) return;
    let fired = false;
    const tick = () => {
      const diff = targetMs - Date.now();
      setRemaining(diff);
      if (diff <= 0 && !fired) {
        fired = true;
        onComplete?.();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetMs, onComplete]);

  if (Number.isNaN(targetMs)) return null;

  const t = remaining === null ? null : breakdown(remaining);
  const segments = t
    ? [
        { value: t.days, unit: "天" },
        { value: t.hours, unit: "时" },
        { value: t.minutes, unit: "分" },
        { value: t.seconds, unit: "秒" },
      ]
    : [
        { value: 0, unit: "天" },
        { value: 0, unit: "时" },
        { value: 0, unit: "分" },
        { value: 0, unit: "秒" },
      ];

  // 天数为 0 时不展示「天」段，更紧凑。
  const visible = segments[0].value > 0 ? segments : segments.slice(1);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest text-stardust">
        <Timer className="h-3.5 w-3.5 text-signal" aria-hidden />
        {label}
      </span>
      <div className="flex items-center gap-2" aria-live="polite">
        {visible.map((seg, index) => (
          <div key={seg.unit} className="flex items-center gap-2">
            <div className="flex min-w-[3rem] flex-col items-center rounded-xl border border-signal/25 bg-signal/5 px-2.5 py-1.5">
              <span className="font-heading text-lg font-bold text-white tabular-nums md:text-xl">
                {String(seg.value).padStart(2, "0")}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-widest text-stardust">{seg.unit}</span>
            </div>
            {index < visible.length - 1 ? <span className="font-heading text-lg text-signal/50">:</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
