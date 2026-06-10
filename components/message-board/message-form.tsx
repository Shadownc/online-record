"use client";

import { useState } from "react";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import { ArrowLeft, Eye, Send, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import { useAsyncAction } from "@/lib/use-async-action";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

export type PublicMessage = {
  id: string;
  username: string;
  content: string;
  createdAt: string | Date;
  reactionCount: number;
  reactedByMe: boolean;
};

export function MessageForm({
  username,
  onCreated,
  maxLength = 800,
}: {
  username: string;
  onCreated: (message: PublicMessage) => void;
  maxLength?: number;
}) {
  const [content, setContent] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  // 字段级错误：内容框专属，显示在框下方并高亮红边。
  const [contentError, setContentError] = useState("");
  const { toast } = useToast();

  const submit = useAsyncAction(
    async () => {
      const data = await apiFetch<{ message: PublicMessage | null; pending?: boolean }>("/api/messages", {
        method: "POST",
        body: { username, content: content.trim() },
      });
      return data;
    },
    {
      onSuccess: (data) => {
        // 命中"进待审核"敏感词时 message 为 null：不插入卡片，提示等待审核。
        if (data.pending || !data.message) {
          submit.setStatus("留言已提交，等待审核通过后展示。");
          toast("留言已提交，等待审核通过后展示。", "info");
        } else {
          onCreated(data.message);
          toast("你的心声已进入信号网络 ✨", "success");
        }
        setContent("");
        setEmojiOpen(false);
        setPreview(false);
      },
      onError: (error) => {
        toast(error.message, "error");
      },
    },
  );

  function insertEmoji(emoji: string) {
    setContent((current) => `${current}${emoji}`.slice(0, maxLength));
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    insertEmoji(emojiData.emoji);
  }

  // 第一步：校验后进入预览。
  function goPreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit.reset();
    setContentError("");
    const text = content.trim();
    if (!username) {
      submit.setError("请先创建用户名");
      return;
    }
    if (!text) {
      setContentError("留言不能为空");
      return;
    }
    if (text.length > maxLength) {
      setContentError(`留言最多 ${maxLength} 个字符`);
      return;
    }
    setEmojiOpen(false);
    setPreview(true);
  }

  // 第二步：确认发送。
  function confirmSend() {
    void submit.run();
  }

  const previewTime = formatDateTime(new Date());

  // 预览态：把当前输入渲染成卡片，确认后再发送。
  if (preview) {
    return (
      <GlassCard className="p-5 md:p-6">
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Preview signal</p>
              <h2 className="mt-2 font-heading text-xl font-semibold text-white md:text-2xl">确认你的信号</h2>
            </div>
            <p className="font-mono text-xs text-stardust">发送前预览</p>
          </div>

          <article className="relative min-h-44 overflow-hidden rounded-2xl border border-signal/35 bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(5,8,18,0.9)_58%)] p-5 shadow-[0_18px_50px_-34px_rgba(34,211,238,0.72)]">
            <div className="absolute left-4 top-4 h-2 w-2 rounded-full bg-signal glow-node" aria-hidden />
            <div className="relative pt-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Node preview</p>
                  <h3 className="mt-2 font-heading text-base font-semibold text-white md:text-lg">{username}</h3>
                </div>
                <span className="rounded-full border border-signal/20 bg-signal/10 px-2 py-1 font-mono text-[10px] text-signal">●</span>
              </div>
              <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90">{content.trim()}</p>
              <time className="mt-5 block font-mono text-[11px] text-stardust">{previewTime}</time>
            </div>
          </article>

          {submit.error ? <p className="text-sm text-red-300">{submit.error}</p> : null}
          {submit.status ? <p className="text-sm text-signal">{submit.status}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={confirmSend} disabled={submit.loading}>
              <Send className="h-4 w-4" aria-hidden />
              {submit.loading ? "正在广播..." : "确认发送"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setPreview(false)} disabled={submit.loading}>
              <ArrowLeft className="h-4 w-4" aria-hidden />
              返回编辑
            </Button>
          </div>
        </div>
      </GlassCard>
    );
  }

  // 编辑态：填写表单，点"预览"进入确认。
  return (
    <GlassCard className="p-5 md:p-6">
      <form onSubmit={goPreview} className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Broadcast signal</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white md:text-2xl">写入一枚信号节点</h2>
          </div>
          <p className="font-mono text-xs text-stardust">{content.length}/{maxLength}</p>
        </div>
        <div className="space-y-1.5">
          <Textarea
            value={content}
            maxLength={maxLength}
            onChange={(event) => {
              setContent(event.target.value);
              if (contentError) setContentError("");
            }}
            placeholder="写下你的愿望或留言，可以点下面的 emoji ✨🌌🚀"
            aria-label="留言内容"
            aria-invalid={contentError ? true : undefined}
            className={contentError ? "border-red-400/60 focus-visible:border-red-400" : undefined}
          />
          {contentError ? <p className="text-xs text-red-300">{contentError}</p> : null}
        </div>

        <div className="overflow-hidden rounded-2xl border border-signal/15 bg-[#030712]/50 p-3">
          <button
            type="button"
            onClick={() => setEmojiOpen((current) => !current)}
            className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-sm text-white transition hover:bg-signal/10 focus-ring"
          >
            <span className="inline-flex items-center gap-2">
              <SmilePlus className="h-4 w-4 text-signal" aria-hidden />
              选择 emoji 表情
            </span>
            <span className="font-mono text-xs text-stardust">{emojiOpen ? "收起" : "展开"}</span>
          </button>
          {emojiOpen ? (
            <div className="mt-3 rounded-2xl border border-signal/15 bg-[#050812] p-2 shadow-[0_0_30px_-14px_rgba(34,211,238,0.45)]">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                theme={Theme.DARK}
                emojiStyle={EmojiStyle.NATIVE}
                width="100%"
                height={360}
                lazyLoadEmojis
                searchPlaceHolder="搜索 emoji"
                previewConfig={{ showPreview: false }}
                skinTonesDisabled
              />
            </div>
          ) : null}
        </div>

        {submit.error ? <p className="text-sm text-red-300">{submit.error}</p> : null}
        {submit.status ? <p className="text-sm text-signal">{submit.status}</p> : null}
        <Button type="submit" disabled={!username}>
          <Eye className="h-4 w-4" aria-hidden />
          预览并发送
        </Button>
      </form>
    </GlassCard>
  );
}
