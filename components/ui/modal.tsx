"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-black/75 backdrop-blur-sm" type="button" aria-label="关闭弹窗" onClick={onClose} />
      <div
        className={cn(
          "relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#08090c]/95 p-5 shadow-[0_0_60px_-12px_rgba(247,147,26,0.35)] backdrop-blur-xl md:p-6",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-20" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-bitcoin/60 hover:text-bitcoin focus-ring"
          aria-label="关闭"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <div className="relative pt-6">{children}</div>
      </div>
    </div>
  );
}
