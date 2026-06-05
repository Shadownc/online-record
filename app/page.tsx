"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClosedAnimation } from "@/components/message-board/closed-animation";
import { MessageForm, type PublicMessage } from "@/components/message-board/message-form";
import { MessageList } from "@/components/message-board/message-list";
import { UsernameGate } from "@/components/message-board/username-gate";

type SettingState = { isOpen: boolean; closedNotice: string };

const floatingNotes = [
  { text: "愿望上链", className: "left-6 top-28 hidden rotate-[-8deg] border-bitcoin/30 bg-bitcoin/10 text-bitcoin lg:block" },
  { text: "✨ emoji ready", className: "right-10 top-36 hidden rotate-[7deg] border-gold/30 bg-gold/10 text-gold lg:block" },
  { text: "IP logged", className: "bottom-28 left-12 hidden rotate-[5deg] border-white/15 bg-white/5 text-stardust xl:block" },
  { text: "Wish Wall", className: "bottom-40 right-16 hidden rotate-[-6deg] border-burnt/30 bg-burnt/10 text-bitcoin xl:block" },
];

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [setting, setSetting] = useState<SettingState>({ isOpen: true, closedNotice: "留言暂未开放" });
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const loadMessages = useCallback(async () => {
    const response = await fetch("/api/messages", { cache: "no-store" });
    const data = await response.json();
    setMessages(data.messages ?? []);
    setSetting(data.setting ?? { isOpen: true, closedNotice: "留言暂未开放" });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages().catch(() => setLoading(false));
  }, [loadMessages]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-35" aria-hidden />
      <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-bitcoin/10 blur-[120px]" aria-hidden />
      <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-gold/5 blur-[140px]" aria-hidden />
      <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-burnt/10 blur-[150px]" aria-hidden />
      <div className="absolute inset-0 texture-cubes opacity-[0.04]" aria-hidden />

      {floatingNotes.map((note) => (
        <div
          key={note.text}
          className={`pointer-events-none absolute z-10 animate-float rounded-2xl border px-4 py-3 font-mono text-xs uppercase tracking-widest shadow-card backdrop-blur-md ${note.className}`}
          aria-hidden
        >
          {note.text}
        </div>
      ))}

      <section className="relative mx-auto max-w-5xl px-6 py-8 md:px-8 md:py-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-5 shadow-card backdrop-blur-lg md:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(247,147,26,0.18),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(255,214,0,0.09),transparent_28%)]" aria-hidden />
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-bitcoin/20" aria-hidden />
          <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge live>Innermost Thoughts</Badge>
              <h1 className="mt-4 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                心
                <span className="bg-gradient-to-r from-bitcoin to-gold bg-clip-text text-transparent"> 声</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stardust">
                首页就是许愿墙，公开留言会像便利贴一样贴在链上面板中。点击“去留言”，先设置昵称，再选择 emoji 写下愿望。
              </p>
            </div>
            {setting.isOpen ? (
              <Button type="button" size="md" onClick={() => setComposeOpen(true)} className="shrink-0">
                去留言
              </Button>
            ) : null}
          </div>

          <div className="relative mt-5 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Total notes</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-white">{messages.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Status</p>
              <p className="mt-2 font-heading text-lg font-semibold text-bitcoin">{setting.isOpen ? "Open" : "Paused"}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Supports</p>
              <p className="mt-2 font-heading text-lg font-semibold text-white">Text + Emoji</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:px-8">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center font-mono text-sm uppercase tracking-widest text-stardust backdrop-blur-lg">Loading wish wall...</div>
        ) : setting.isOpen ? (
          <MessageList messages={messages} />
        ) : (
          <ClosedAnimation notice={setting.closedNotice} />
        )}
      </section>

      {setting.isOpen ? (
        <Modal open={composeOpen} title="发布留言" onClose={() => setComposeOpen(false)}>
          <div className="space-y-5">
            <div className="pr-10">
              <Badge>Compose wish</Badge>
              <h2 className="mt-3 font-heading text-xl font-bold text-white md:text-2xl">发布一张新便利贴</h2>
              <p className="mt-2 text-sm leading-relaxed text-stardust">如果还没有昵称，请先创建昵称；之后就可以选择 emoji 并留言。</p>
            </div>
            <UsernameGate onReady={setUsername} />
            <MessageForm
              username={username}
              onCreated={(message) => {
                setMessages((current) => [message, ...current]);
                setComposeOpen(false);
              }}
            />
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
