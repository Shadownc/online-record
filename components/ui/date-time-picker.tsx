"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseValue(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function DateTimePicker({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const days = useMemo(() => {
    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1);
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - firstDay.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [view]);

  function selectDay(day: Date) {
    const next = selected ? new Date(selected) : new Date();
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    next.setSeconds(0, 0);
    onChange(toValue(next));
  }

  function setTime(part: "hour" | "minute", raw: string) {
    const next = selected ? new Date(selected) : new Date();
    if (part === "hour") next.setHours(Number(raw));
    if (part === "minute") next.setMinutes(Number(raw));
    next.setSeconds(0, 0);
    onChange(toValue(next));
  }

  const display = selected
    ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(selected)
    : "不限制";

  return (
    <div className="relative" ref={containerRef}>
      <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-stardust">{label}</span>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-[#030712]/70 px-4 text-left text-sm text-white transition hover:border-signal/50 focus-ring"
      >
        <span>{display}</span>
        <Calendar className="h-4 w-4 text-signal" aria-hidden />
      </button>

      {open ? (
        <div className="sci-panel sci-border absolute z-30 mt-3 w-full min-w-[320px] rounded-2xl border p-4 shadow-card backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-sm text-stardust hover:text-white focus-ring" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}>
              上月
            </button>
            <p className="font-heading text-base font-semibold text-white">
              {view.getFullYear()} / {pad(view.getMonth() + 1)}
            </p>
            <button type="button" className="rounded-full border border-white/10 px-3 py-1 text-sm text-stardust hover:text-white focus-ring" onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}>
              下月
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-widest text-stardust">
            {["日", "一", "二", "三", "四", "五", "六"].map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isCurrentMonth = day.getMonth() === view.getMonth();
              const isSelected = selected && day.toDateString() === selected.toDateString();
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={cn(
                    "h-9 rounded-lg font-mono text-xs transition focus-ring",
                    isCurrentMonth ? "text-white" : "text-white/30",
                    isSelected ? "bg-gradient-to-r from-signal to-plasma text-white shadow-[0_0_18px_-5px_rgba(34,211,238,0.7)]" : "hover:bg-signal/10 hover:text-signal",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-[#030712]/70 p-3">
            <Clock className="h-4 w-4 text-signal" aria-hidden />
            <select className="h-10 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white focus-ring" value={selected ? selected.getHours() : 0} onChange={(event) => setTime("hour", event.target.value)}>
              {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{pad(hour)} 时</option>)}
            </select>
            <select className="h-10 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white focus-ring" value={selected ? selected.getMinutes() : 0} onChange={(event) => setTime("minute", event.target.value)}>
              {Array.from({ length: 60 }, (_, minute) => <option key={minute} value={minute}>{pad(minute)} 分</option>)}
            </select>
          </div>

          <div className="mt-4 flex justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}>清空</Button>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>完成</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
