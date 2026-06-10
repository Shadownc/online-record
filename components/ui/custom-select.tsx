"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
};

export function CustomSelect({ value, onChange, options, placeholder }: CustomSelectProps) {
  const [open, setOpen] = useState(false);
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

  const selectedOption = options.find((opt) => opt.value === value);
  const display = selectedOption?.label || placeholder || "请选择";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-white/20 bg-white/5 px-4 text-left text-sm text-white transition hover:border-white/30 focus:border-signal/60 focus:outline-none focus:ring-2 focus:ring-signal/20"
      >
        <span className={value ? "text-white" : "text-stardust/60"}>{display}</span>
        <ChevronDown className={cn("h-4 w-4 text-stardust transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-[60] mt-2 w-full overflow-hidden rounded-lg border border-white/20 bg-[#050812] shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2.5 text-sm text-white transition hover:bg-white/5"
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="h-4 w-4 text-signal" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
