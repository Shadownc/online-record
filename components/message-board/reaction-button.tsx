"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

/**
 * 自包含的共鸣（点赞）按钮，内部维护计数与状态，带乐观更新。
 * 用于留言详情页等没有父级列表状态的场景。
 */
export function ReactionButton({
  messageId,
  initialCount,
  initialReacted,
  size = "md",
}: {
  messageId: string;
  initialCount: number;
  initialReacted: boolean;
  size?: "md" | "lg";
}) {
  const [count, setCount] = useState(initialCount);
  const [reacted, setReacted] = useState(initialReacted);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) return;
    setPending(true);
    // 乐观更新：先翻转，失败再回滚。
    const prevCount = count;
    const prevReacted = reacted;
    setReacted(!prevReacted);
    setCount(prevCount + (prevReacted ? -1 : 1));
    try {
      const data = await apiFetch<{ reacted: boolean; reactionCount: number }>(`/api/messages/${messageId}/react`, {
        method: "POST",
      });
      setReacted(data.reacted);
      setCount(data.reactionCount);
    } catch {
      setReacted(prevReacted);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={reacted}
      aria-label={reacted ? "取消共鸣" : "共鸣"}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-mono transition-all duration-200 focus-ring",
        size === "lg" ? "px-5 py-2.5 text-sm" : "px-3 py-1.5 text-xs",
        reacted
          ? "border-plasma/50 bg-plasma/15 text-plasma"
          : "border-white/15 bg-white/[0.03] text-stardust hover:border-plasma/40 hover:text-plasma",
      )}
    >
      <Heart className={cn(size === "lg" ? "h-5 w-5" : "h-3.5 w-3.5", "transition-transform duration-200", reacted && "scale-110 fill-current")} aria-hidden />
      {count}
    </button>
  );
}
