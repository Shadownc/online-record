import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import type { PublicMessage } from "@/components/message-board/message-form";

export function MessageList({ messages }: { messages: PublicMessage[] }) {
  if (!messages.length) {
    return (
      <Card className="border-dashed bg-white/[0.03] text-center">
        <MessageSquare className="mx-auto h-9 w-9 text-bitcoin" aria-hidden />
        <h2 className="mt-4 font-heading text-xl font-semibold text-white md:text-2xl">等待第一个区块</h2>
        <p className="mt-2 text-sm text-stardust md:text-base">还没有留言。点击“去留言”成为第一个写入网络的人。</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Card key={message.id} className="group relative overflow-hidden p-5 md:p-6">
          <MessageSquare className="absolute -right-4 -top-4 h-20 w-20 rotate-12 text-bitcoin/5 transition-opacity group-hover:text-bitcoin/10" aria-hidden />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Badge>Block #{String(messages.length - index).padStart(3, "0")}</Badge>
              <h3 className="mt-3 font-heading text-lg font-semibold text-white md:text-xl">{message.username}</h3>
            </div>
            <time className="font-mono text-xs text-stardust" dateTime={new Date(message.createdAt).toISOString()}>
              {formatDateTime(message.createdAt)}
            </time>
          </div>
          <p className="relative mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/90 md:text-base">{message.content}</p>
        </Card>
      ))}
    </div>
  );
}
