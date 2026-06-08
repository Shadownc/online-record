"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SciFiBackground } from "@/components/ui/sci-fi-background";
import { ClosedAnimation } from "@/components/message-board/closed-animation";
import { IpBannedPanel } from "@/components/message-board/ip-banned-panel";
import { MessageForm, type PublicMessage } from "@/components/message-board/message-form";
import { MessageList } from "@/components/message-board/message-list";
import { VisitorOrb } from "@/components/message-board/visitor-orb";
import { UsernameGate } from "@/components/message-board/username-gate";

type SettingState = { isOpen: boolean; closedNotice: string };
type BannedState = { ip: string | null; message: string } | null;

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [setting, setSetting] = useState<SettingState>({ isOpen: true, closedNotice: "留言暂未开放" });
  const [banned, setBanned] = useState<BannedState>(null);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);

  const loadMessages = useCallback(async (mode: "latest" | "random" = "latest") => {
    setLoading(true);
    const response = await fetch(`/api/messages${mode === "random" ? "?mode=random" : ""}`, { cache: "no-store" });
    const data = await response.json();
    setMessages(data.messages ?? []);
    setMessageCount(data.messageCount ?? data.messages?.length ?? 0);
    setSetting(data.setting ?? { isOpen: true, closedNotice: "留言暂未开放" });
    setBanned(data.banned ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMessages().catch(() => setLoading(false));
  }, [loadMessages]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <SciFiBackground variant="public" density="high" />

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-8 md:px-8 md:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          <div className="sci-panel sci-border relative overflow-hidden rounded-3xl border p-5 shadow-card backdrop-blur-lg md:p-7">
            <div className="pointer-events-none absolute inset-0 network-lines opacity-20" aria-hidden />
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full border border-signal/20" aria-hidden />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-end">
              <div>
                <Badge live>Innermost Signal</Badge>
                <h1 className="mt-4 font-heading text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
                  心
                  <span className="bg-gradient-to-r from-signal via-cyan-200 to-plasma bg-clip-text text-transparent"> 声</span>
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stardust md:text-base">
                  这里是一片安静可靠的留言空间。点击“去留言”，创建你的信号身份，选择 emoji，把想法温柔地留在这里。
                </p>
              </div>
              {!banned && setting.isOpen ? (
                <Button type="button" size="md" onClick={() => setComposeOpen(true)} className="shrink-0">
                  去留言
                </Button>
              ) : null}
            </div>

            <div className="relative mt-6 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-2xl border border-signal/15 bg-white/[0.035] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Signal nodes</p>
                <p className="mt-2 font-heading text-2xl font-semibold text-white">{messageCount}</p>
              </div>
              <div className="rounded-2xl border border-signal/15 bg-white/[0.035] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Network status</p>
                <p className={banned ? "mt-2 font-heading text-lg font-semibold text-red-300" : "mt-2 font-heading text-lg font-semibold text-signal"}>
                  {banned ? "Blocked" : setting.isOpen ? "Online" : "Paused"}
                </p>
              </div>
              <div className="rounded-2xl border border-signal/15 bg-white/[0.035] p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Payload</p>
                <p className="mt-2 font-heading text-lg font-semibold text-white">Text + Emoji</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <VisitorOrb />
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:px-8">
        {loading ? (
          <div className="sci-panel rounded-2xl border border-white/10 p-8 text-center font-mono text-sm uppercase tracking-widest text-stardust shadow-card backdrop-blur-lg">Loading signal mesh...</div>
        ) : banned ? (
          <IpBannedPanel ip={banned.ip} message={banned.message} />
        ) : setting.isOpen ? (
          <MessageList messages={messages} onRandomRefresh={() => loadMessages("random")} refreshing={loading} />
        ) : (
          <ClosedAnimation notice={setting.closedNotice} />
        )}
      </section>

      {!banned && setting.isOpen ? (
        <Modal open={composeOpen} title="发布留言" onClose={() => setComposeOpen(false)}>
          <div className="space-y-5">
            <div className="pr-10">
              <Badge>Compose signal</Badge>
              <h2 className="mt-3 font-heading text-xl font-bold text-white md:text-2xl">发布一枚新信号节点</h2>
              <p className="mt-2 text-sm leading-relaxed text-stardust">如果还没有昵称，请先创建信号身份；之后就可以选择 emoji 并留言。</p>
            </div>
            <UsernameGate onReady={setUsername} />
            <MessageForm
              username={username}
              onCreated={(message) => {
                setMessages((current) => [message, ...current]);
                setMessageCount((current) => current + 1);
                setComposeOpen(false);
              }}
            />
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
