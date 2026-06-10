"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
  noScroll = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  noScroll?: boolean;
}) {
  useEffect(() => {
    if (open) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      return () => {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  if (!open) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-[#02040a]/82 backdrop-blur-sm" type="button" aria-label="关闭弹窗" onClick={onClose} />
      <div
        className={cn(
          "sci-panel sci-border relative w-full max-w-2xl rounded-2xl border shadow-[0_0_60px_-14px_rgba(34,211,238,0.38)] backdrop-blur-xl",
          !noScroll && "max-h-[90vh]",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 network-lines opacity-10" aria-hidden />
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-signal/60 hover:text-signal focus-ring"
          aria-label="关闭"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        {noScroll ? (
          <div className="relative p-5 pt-16 md:p-6 md:pt-16">
            {children}
          </div>
        ) : (
          <ScrollArea className="h-full p-5 md:p-6">
            <div className="relative pt-6">{children}</div>
          </ScrollArea>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
