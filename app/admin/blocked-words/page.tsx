import { AdminShell } from "@/components/admin/admin-shell";
import { BlockedWordManager } from "@/components/admin/blocked-word-manager";
import { PageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BlockedWordsPage() {
  await requireAdmin();

  const blockedWords = await prisma.blockedWord.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <AdminShell>
      <div className="space-y-6">
        <PageHeader
          badge="Content Filter"
          title="敏感词过滤"
          description="配置发布留言时拦截的敏感词。匹配忽略大小写与空格，可逐词设置命中后是直接拒绝还是入库待审核。"
          stats={[{ label: "Total Words", value: blockedWords.length }]}
        />
        <BlockedWordManager blockedWords={blockedWords} />
      </div>
    </AdminShell>
  );
}
