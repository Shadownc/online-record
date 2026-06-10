import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { ArrowLeft, Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SciFiBackground } from "@/components/ui/sci-fi-background";
import { ReactionButton } from "@/components/message-board/reaction-button";
import { ShareActions } from "@/components/message-board/share-actions";
import { getRequestIp } from "@/lib/ip";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const siteName = () => process.env.SITE_NAME ?? process.env.NEXT_PUBLIC_SITE_NAME ?? "Online Record";

/** 取一条公开可见的留言（含点赞数）；不存在/已隐藏/已删除返回 null。 */
async function getMessage(id: string) {
  return prisma.message.findFirst({
    where: { id, visible: true, deletedAt: null },
    select: { id: true, username: true, content: true, createdAt: true, _count: { select: { reactions: true } } },
  });
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const message = await getMessage(params.id);
  if (!message) {
    return { title: `留言未找到 · ${siteName()}` };
  }
  const snippet = message.content.length > 60 ? `${message.content.slice(0, 60)}…` : message.content;
  const title = `${message.username} 的心声 · ${siteName()}`;
  return {
    title,
    description: snippet,
    openGraph: { title, description: snippet, type: "article" },
    twitter: { card: "summary", title, description: snippet },
  };
}

export default async function MessageDetailPage({ params }: { params: { id: string } }) {
  const message = await getMessage(params.id);
  if (!message) notFound();

  const ip = await getRequestIp();
  const reacted = ip
    ? Boolean(await prisma.messageReaction.findUnique({ where: { messageId_ip: { messageId: message.id, ip } }, select: { id: true } }))
    : false;

  // 从请求头构造当前留言的完整 URL，供复制链接使用。
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const shareUrl = host ? `${proto}://${host}/messages/${message.id}` : "";
  const dateText = formatDateTime(message.createdAt);

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <SciFiBackground variant="public" density="high" />

      <section className="relative z-10 mx-auto max-w-3xl px-6 py-10 md:px-8 md:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 font-mono text-xs text-stardust transition hover:border-signal/40 hover:text-signal focus-ring"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          返回信号网络
        </Link>

        <article className="sci-panel sci-border relative mt-6 overflow-hidden rounded-3xl border p-6 shadow-card backdrop-blur-lg md:p-9">
          <div className="pointer-events-none absolute inset-0 network-lines opacity-15" aria-hidden />
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full border border-signal/20" aria-hidden />

          <div className="relative">
            <Badge live>Signal node</Badge>
            <h1 className="mt-4 font-heading text-2xl font-bold text-white md:text-3xl">{message.username}</h1>
            <time className="mt-2 block font-mono text-xs text-stardust" dateTime={new Date(message.createdAt).toISOString()}>
              {formatDateTime(message.createdAt)}
            </time>

            <p className="mt-6 whitespace-pre-wrap break-words text-base leading-relaxed text-white/90 md:text-lg">
              {message.content}
            </p>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stardust">
                <Radio className="h-4 w-4 text-signal" aria-hidden />
                Innermost Signal
              </span>
              <ReactionButton
                messageId={message.id}
                initialCount={message._count.reactions}
                initialReacted={reacted}
                size="lg"
              />
            </div>

            <div className="mt-6">
              <ShareActions
                url={shareUrl}
                username={message.username}
                content={message.content}
                dateText={dateText}
                siteName={siteName()}
              />
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
