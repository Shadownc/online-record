"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard className="p-6">
      <form onSubmit={submitMessage} className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-bitcoin">Broadcast</p>
            <h2 className="mt-2 font-heading text-2xl font-semibold text-white">写入留言区块</h2>
          </div>
          <p className="font-mono text-xs text-stardust">{content.length}/800</p>
        </div>
        <Textarea
          value={content}
          maxLength={800}
          onChange={(event) => setContent(event.target.value)}
          placeholder="留下你的想法，emoji 也可以直接输入 ✨🔥₿"
          aria-label="留言内容"
        />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" disabled={loading || !username}>
          <Send className="h-4 w-4" aria-hidden />
          {loading ? "正在广播..." : "发布留言"}
        </Button>
      </form>
    </GlassCard>
  );
}
