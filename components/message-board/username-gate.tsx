"use client";

import { useEffect, useState } from "react";
import { KeyRound, Orbit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const STORAGE_KEY = "online-record-username";

export function getStoredUsername() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(STORAGE_KEY) ?? "";
}

export function UsernameGate({ onReady }: { onReady: (username: string) => void }) {
  const [username, setUsername] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = getStoredUsername();
    if (stored) {
      setUsername(stored);
      setDraft(stored);
      onReady(stored);
    }
  }, [onReady]);

  function saveUsername(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = draft.trim();
    if (next.length < 2) {
      setError("用户名至少 2 个字符");
      return;
    }
    if (next.length > 24) {
      setError("用户名最多 24 个字符");
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, next);
    setUsername(next);
    onReady(next);
    setError("");
  }

  if (username) {
    return (
      <GlassCard className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge live>Identity linked</Badge>
          <p className="mt-3 font-heading text-xl font-semibold text-white">{username}</p>
          <p className="text-sm text-stardust">你的信号身份已保存在本地浏览器。</p>
        </div>
        <Button type="button" variant="outline" onClick={() => setUsername("")}>
          更换用户名
        </Button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="relative overflow-hidden p-6">
      <Orbit className="absolute -right-6 -top-6 h-28 w-28 rotate-12 text-signal/10" aria-hidden />
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg border border-signal/40 bg-signal/15 p-3 text-signal shadow-signal">
          <KeyRound className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <Badge>Step 01</Badge>
          <h2 className="mt-2 font-heading text-2xl font-semibold text-white">创建信号身份</h2>
        </div>
      </div>
      <form onSubmit={saveUsername} className="space-y-4">
        <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="输入你的用户名，例如 Nova" aria-label="用户名" />
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <Button type="submit" className="w-full sm:w-auto">进入留言网络</Button>
      </form>
    </GlassCard>
  );
}
