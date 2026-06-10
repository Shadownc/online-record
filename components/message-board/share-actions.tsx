"use client";

import { useState } from "react";
import { Check, Copy, Download, Image as ImageIcon } from "lucide-react";
import { Modal } from "@/components/ui/modal";
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
      const scale = 2;
      const width = 600;
      const padding = 48;
      const contentWidth = width - padding * 2;

      const probe = document.createElement("canvas");
      const pctx = probe.getContext("2d");
      if (!pctx) return;
      pctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      const lines = wrapText(pctx, content, contentWidth);
      const lineHeight = 34;
      const contentHeight = lines.length * lineHeight;
      const height = Math.max(450, padding + 140 + contentHeight + 110);

      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(scale, scale);

      // 深色渐变背景
      const bg = ctx.createLinearGradient(0, 0, 0, height);
      bg.addColorStop(0, "#0a0e1a");
      bg.addColorStop(1, "#050812");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      // 网格背景
      ctx.strokeStyle = "rgba(34,211,238,0.03)";
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 30) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // 左上角光晕
      const glow1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 300);
      glow1.addColorStop(0, "rgba(34,211,238,0.15)");
      glow1.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, width, height);

      // 右下角光晕
      const glow2 = ctx.createRadialGradient(width, height, 0, width, height, 350);
      glow2.addColorStop(0, "rgba(167,139,250,0.12)");
      glow2.addColorStop(1, "rgba(167,139,250,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, width, height);

      // 主边框（双层）
      ctx.strokeStyle = "rgba(34,211,238,0.4)";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);
      ctx.strokeStyle = "rgba(34,211,238,0.15)";
      ctx.lineWidth = 1;
      ctx.strokeRect(24, 24, width - 48, height - 48);

      // 顶部装饰条
      const headerGrad = ctx.createLinearGradient(padding, padding - 5, padding + 200, padding - 5);
      headerGrad.addColorStop(0, "rgba(34,211,238,0.6)");
      headerGrad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = headerGrad;
      ctx.fillRect(padding, padding - 5, 200, 3);

      // 标签背景
      ctx.fillStyle = "rgba(34,211,238,0.1)";
      ctx.fillRect(padding, padding + 8, 160, 24);

      // 标签文字
      ctx.fillStyle = "#22D3EE";
      ctx.font = "600 10px 'Courier New', monospace";
      ctx.fillText("◆ INNERMOST SIGNAL", padding + 8, padding + 24);

      // 昵称
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.fillText(username, padding, padding + 70);

      // 昵称下划线
      const nameWidth = ctx.measureText(username).width;
      const underlineGrad = ctx.createLinearGradient(padding, 0, padding + nameWidth, 0);
      underlineGrad.addColorStop(0, "rgba(34,211,238,0.5)");
      underlineGrad.addColorStop(1, "rgba(167,139,250,0.5)");
      ctx.strokeStyle = underlineGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 78);
      ctx.lineTo(padding + nameWidth, padding + 78);
      ctx.stroke();

      // 时间
      ctx.fillStyle = "#94A3B8";
      ctx.font = "14px 'Courier New', monospace";
      ctx.fillText(dateText, padding, padding + 105);

      // 分隔线（渐变）
      const dividerGrad = ctx.createLinearGradient(padding, 0, width - padding, 0);
      dividerGrad.addColorStop(0, "rgba(34,211,238,0)");
      dividerGrad.addColorStop(0.5, "rgba(34,211,238,0.3)");
      dividerGrad.addColorStop(1, "rgba(34,211,238,0)");
      ctx.strokeStyle = dividerGrad;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding + 130);
      ctx.lineTo(width - padding, padding + 130);
      ctx.stroke();

      // 内容
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.font = "20px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
      ctx.shadowColor = "rgba(34,211,238,0.3)";
      ctx.shadowBlur = 20;
      let y = padding + 130 + 45;
      for (const line of lines) {
        ctx.fillText(line, padding, y);
        y += lineHeight;
      }
      ctx.shadowBlur = 0;

      // 底部站点名背景
      ctx.fillStyle = "rgba(167,139,250,0.08)";
      ctx.fillRect(padding, height - padding - 32, width - padding * 2, 28);

      // 底部站点名
      ctx.fillStyle = "#A78BFA";
      ctx.font = "600 13px 'Courier New', monospace";
      ctx.fillText(siteName, padding + 8, height - padding - 12);

      canvas.toBlob((blob) => {
        if (!blob) {
          setDrawing(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setDrawing(false);
      }, "image/png");
    } catch {
      setDrawing(false);
    }
  }

  function downloadImage() {
    if (!previewUrl) return;
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = `signal-${username}.png`;
    link.click();
  }

  function closePreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }

  const btnClass =
    "inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-xs text-stardust transition hover:border-signal/40 hover:text-signal focus-ring disabled:opacity-50";

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copyLink} className={cn(btnClass, copied && "border-signal/50 text-signal")}>
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "已复制链接" : "复制链接"}
        </button>
        <button type="button" onClick={generateImage} disabled={drawing} className={btnClass}>
          {drawing ? <ImageIcon className="h-4 w-4 animate-pulse" aria-hidden /> : <ImageIcon className="h-4 w-4" aria-hidden />}
          {drawing ? "生成中..." : "保存分享图"}
        </button>
      </div>

      <Modal open={Boolean(previewUrl)} title="分享图预览" onClose={closePreview} className="max-w-2xl" noScroll>
        {previewUrl ? (
          <div className="flex flex-col gap-4">
            <img src={previewUrl} alt="分享图预览" className="w-full rounded-lg shadow-lg" />
            <button type="button" onClick={downloadImage} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-signal/40 bg-signal/10 px-5 py-3 font-mono text-sm font-medium text-signal transition hover:bg-signal/20 focus-ring">
              <Download className="h-4 w-4" aria-hidden />
              下载图片
            </button>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
