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
      <div className="absolute inset-0 texture-cubes opacity-[0.04]" aria-hidden />

      <section className="relative mx-auto max-w-5xl px-6 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-black/35 p-6 shadow-card backdrop-blur-lg md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <Badge live>Bitcoin DeFi Message Board</Badge>
            <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              数字黄金
              <span className="bg-gradient-to-r from-bitcoin to-gold bg-clip-text text-transparent"> 留言链</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stardust md:text-base">
              首页直接展示全部公开留言。点击按钮进入留言流程，首次留言前先设置昵称，支持纯文本和 emoji。
            </p>
          </div>
          {setting.isOpen ? (
            <Button type="button" size="lg" onClick={() => setComposeOpen(true)} className="shrink-0">
              去留言
            </Button>
          ) : null}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-5xl gap-6 px-6 pb-24 md:px-8">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center font-mono text-sm uppercase tracking-widest text-stardust backdrop-blur-lg">Loading ledger...</div>
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
              <Badge>Compose block</Badge>
              <h2 className="mt-3 font-heading text-2xl font-bold text-white md:text-3xl">发布一条新留言</h2>
              <p className="mt-2 text-sm leading-relaxed text-stardust">如果还没有昵称，请先创建昵称；之后就可以直接留言。</p>
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
