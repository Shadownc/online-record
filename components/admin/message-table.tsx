"use client";

import { useRouter } from "next/navigation";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

type Message = {
  id: string;
  username: string;
  content: string;
  ip: string | null;
  userAgent: string | null;
  visible: boolean;
  createdAt: Date | string;
};

export function MessageTable({ messages }: { messages: Message[] }) {
  const router = useRouter();

  async function updateMessage(id: string, body: Record<string, unknown>) {
    const response = await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (response.ok) router.refresh();
  }

  if (!messages.length) {
    return <p className="sci-panel rounded-2xl border border-white/10 p-8 text-center text-stardust">暂无留言。</p>;
  }

  return (
    <div className="sci-panel overflow-hidden rounded-2xl border border-white/10 backdrop-blur-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm">
          <thead className="bg-white/[0.03] font-mono text-xs uppercase tracking-widest text-stardust">
            <tr>
              <th className="px-5 py-4">用户</th>
              <th className="px-5 py-4">留言</th>
              <th className="px-5 py-4">IP / UA</th>
              <th className="px-5 py-4">时间</th>
              <th className="px-5 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {messages.map((message) => (
              <tr key={message.id} className="align-top transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-4">
                  <p className="font-heading font-semibold text-white">{message.username}</p>
                  <p className={message.visible ? "mt-1 font-mono text-xs text-signal" : "mt-1 font-mono text-xs text-red-300"}>
                    {message.visible ? "VISIBLE" : "HIDDEN"}
                  </p>
                </td>
                <td className="max-w-md px-5 py-4 text-stardust">
                  <p className="line-clamp-4 whitespace-pre-wrap break-words">{message.content}</p>
                </td>
                <td className="max-w-xs px-5 py-4 font-mono text-xs text-stardust">
                  <p>{message.ip ?? "unknown"}</p>
                  <p className="mt-2 line-clamp-2 text-white/40">{message.userAgent ?? "unknown user-agent"}</p>
                </td>
                <td className="px-5 py-4 font-mono text-xs text-stardust">{formatDateTime(message.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => updateMessage(message.id, { visible: !message.visible })}>
                      {message.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {message.visible ? "隐藏" : "恢复"}
                    </Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => updateMessage(message.id, { deleted: true })}>
                      <Trash2 className="h-4 w-4" />
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
