"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "success" | "error" | "info";

type ToastItem = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  /** 弹出一条 toast，duration 毫秒后自动消失（默认 3500，0 表示不自动消失）。 */
  toast: (message: string, kind?: ToastKind, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 在客户端组件里取 toast 函数。Provider 缺失时返回 no-op，避免崩溃。 */
export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}

const kindStyles: Record<ToastKind, { border: string; icon: typeof CheckCircle2; iconColor: string }> = {
  success: { border: "border-signal/40", icon: CheckCircle2, iconColor: "text-signal" },
  error: { border: "border-red-400/40", icon: XCircle, iconColor: "text-red-300" },
  info: { border: "border-plasma/40", icon: Info, iconColor: "text-plasma" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, kind: ToastKind = "info", duration = 3500) => {
      const id = (counter.current += 1);
      setItems((current) => [...current, { id, kind, message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
        {items.map((item) => {
          const style = kindStyles[item.kind];
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-[#050a16]/90 px-4 py-3 shadow-card backdrop-blur-lg animate-toast-in",
                style.border,
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconColor)} aria-hidden />
              <p className="flex-1 text-sm leading-relaxed text-white/90">{item.message}</p>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="关闭提示"
                className="shrink-0 rounded-full p-1 text-stardust transition hover:text-white focus-ring"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
