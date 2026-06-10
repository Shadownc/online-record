"use client";

import { useState } from "react";
import { Check, Copy, Download, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 留言详情页的分享操作：复制链接 + 客户端 Canvas 生成分享图下载。
 * 不依赖任何外部库，分享图是科幻风格的深色卡片。
 */
export function ShareActions({
  url,
  username,
  content,
  dateText,
  siteName,
}: {
  url: string;
  username: string;
  content: string;
  dateText: string;
  siteName: string;
}) {
  const [copied, setCopied] = useState(false);
  const [drawing, setDrawing] = useState(false);

  async function copyLink() {
    const link = url || (typeof window !== "undefined" ? window.location.href : "");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        // 降级：临时 textarea + execCommand
        const textarea = document.createElement("textarea");
        textarea.value = link;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 复制失败静默处理，用户可手动复制地址栏
    }
  }

  /** 按容器宽度对文本做断行（逐字符测量，兼容中英文混排）。 */
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const lines: string[] = [];
    for (const paragraph of text.split("\n")) {
      if (paragraph === "") {
        lines.push("");
        continue;
      }
      let current = "";
      for (const char of paragraph) {
        const next = current + char;
        if (ctx.measureText(next).width > maxWidth && current) {
          lines.push(current);
          current = char;
        } else {
          current = next;
        }
      }
      if (current) lines.push(current);
    }
    return lines;
  }

  function generateImage() {
    setDrawing(true);
    try {
      const scale = 2; // 高清导出
      const width = 600;
      const padding = 48;
      const contentWidth = width - padding * 2;

      // 先用临时 canvas 测量内容高度
      const probe = document.createElement("canvas");
      const pctx = probe.getContext("2d");
      if (!pctx) return;
      pctx.font = "28px sans-serif";
      const lines = wrapText(pctx, content, contentWidth);
      const lineHeight = 42;
      const contentHeight = lines.length * lineHeight;
      const height = Math.max(420, padding + 150 + contentHeight + 120);

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);

      // 背景：深色渐变
      const bg = ctx.createLinearGradient(0, 0, width, height);
      bg.addColorStop(0, "#050a16");
      bg.addColorStop(1, "#0a1426");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // 边框光晕
      ctx.strokeStyle = "rgba(34,211,238,0.35)";
      ctx.lineWidth = 2;
      ctx.strokeRect(12, 12, width - 24, height - 24);

      // 顶部标签
      ctx.fillStyle = "#22D3EE";
      ctx.font = "600 13px monospace";
      ctx.fillText("◆ INNERMOST SIGNAL", padding, padding + 8);

      // 昵称
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 36px sans-serif";
      ctx.fillText(username, padding, padding + 60);

      // 时间
      ctx.fillStyle = "#94A3B8";
      ctx.font = "20px monospace";
      ctx.fillText(dateText, padding, padding + 92);

      // 分隔线
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 116);
      ctx.lineTo(width - padding, padding + 116);
      ctx.stroke();

      // 内容
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.font = "28px sans-serif";
      let y = padding + 116 + 48;
      for (const line of lines) {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      }

      // 底部站点名
      ctx.fillStyle = "#A78BFA";
      ctx.font = "600 18px monospace";
      ctx.fillText(siteName, padding, height - padding + 4);

      canvas.toBlob((blob) => {
        if (!blob) {
          setDrawing(false);
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `signal-${username}.png`;
        link.click();
        URL.revokeObjectURL(link.href);
        setDrawing(false);
      }, "image/png");
    } catch {
      setDrawing(false);
    }
  }

  const btnClass =
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-xs text-stardust transition hover:border-signal/40 hover:text-signal focus-ring disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-3">
      <button type="button" onClick={copyLink} className={cn(btnClass, copied && "border-signal/50 text-signal")}>
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? "已复制链接" : "复制链接"}
      </button>
      <button type="button" onClick={generateImage} disabled={drawing} className={btnClass}>
        {drawing ? <ImageIcon className="h-4 w-4 animate-pulse" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
        {drawing ? "生成中..." : "保存分享图"}
      </button>
    </div>
  );
}
