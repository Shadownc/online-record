"use client";

import { useState } from "react";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import { Send, SmilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export type PublicMessage = {
  id: string;
  username: string;
  content: string;
  createdAt: string | Date;
};

export function MessageForm({ username, onCreated }: { username: string; onCreated: (message: PublicMessage) => void }) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);

  function insertEmoji(emoji: string) {
    setContent((current) => `${current}${emoji}`.slice(0, 800));
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    insertEmoji(emojiData.emoji);
  }

  async function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const text = content.trim();
    if (!username) {
      setError("请先创建用户名");
      return;
    }
    if (!text) {
      setError("留言不能为空");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, content: text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "提交失败");
      onCreated(data.message);
      setContent("");
      setEmojiOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-5 md:p-6">
      <form onSubmit={submitMessage} className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Broadcast signal</p>
            <h2 className="mt-2 font-heading text-xl font-semibold text-white md:text-2xl">写入一枚信号节点</h2>
          </div>
          <p className="font-mono text-xs text-stardust">{content.length}/800</p>
        </div>
        <Textarea
          value={content}
          maxLength={800}
          onChange={(event) => setContent(event.target.value)}
          placeholder="写下你的愿望或留言，可以点下面的 emoji ✨🌌🚀"
          aria-label="留言内容"
        />

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

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={loading || !username}>
          <Send className="h-4 w-4" aria-hidden />
          {loading ? "正在广播..." : "发送到星际网络"}
        </Button>
      </form>
    </GlassCard>
  );
}
