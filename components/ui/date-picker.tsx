"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseValue(value: string) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function DatePicker({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  const selected = parseValue(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

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

  useEffect(() => {
    if (open && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
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
    onChange(toDateValue(day));
    setOpen(false);
  }

  const display = selected
    ? new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" }).format(selected)
    : placeholder || "选择日期";

  const calendar = open ? (
    <div
      className="sci-panel sci-border fixed z-[9999] min-w-[280px] rounded-xl border p-4 shadow-card backdrop-blur-xl"
      style={{ top: position.top, left: position.left, width: Math.max(position.width, 280) }}
    >
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-stardust transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-signal/20"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() - 1, 1))}
        >
          上月
        </button>
        <p className="font-heading text-sm font-semibold text-white">
          {view.getFullYear()} / {pad(view.getMonth() + 1)}
        </p>
        <button
          type="button"
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-stardust transition hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-signal/20"
          onClick={() => setView(new Date(view.getFullYear(), view.getMonth() + 1, 1))}
        >
          下月
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] uppercase tracking-wider text-stardust">
        {["日", "一", "二", "三", "四", "五", "六"].map((day) => (
          <span key={day} className="py-1">
            {day}
          </span>
        ))}
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
                "h-8 rounded-lg font-mono text-xs transition focus:outline-none focus:ring-2 focus:ring-signal/20",
                isCurrentMonth ? "text-white" : "text-white/30",
                isSelected
                  ? "bg-gradient-to-r from-signal to-plasma text-white shadow-[0_0_12px_-3px_rgba(34,211,238,0.6)]"
                  : "hover:bg-signal/10 hover:text-signal",
              )}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-white/20 bg-white/5 px-4 text-left text-sm text-white transition hover:border-white/30 focus:border-signal/60 focus:outline-none focus:ring-2 focus:ring-signal/20"
      >
        <span className={selected ? "text-white" : "text-stardust/60"}>{display}</span>
        <div className="flex items-center gap-2">
          {selected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="rounded p-0.5 hover:bg-white/10"
            >
              <X className="h-3.5 w-3.5 text-stardust" />
            </button>
          )}
          <Calendar className="h-4 w-4 text-stardust" aria-hidden />
        </div>
      </button>

      {typeof window !== "undefined" && calendar && createPortal(calendar, document.body)}
    </div>
  );
}
