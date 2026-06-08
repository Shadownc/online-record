import Link from "next/link";
import { cn } from "@/lib/utils";

function buildHref(basePath: string, searchParams: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

type PaginationProps = {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
};

export function Pagination({ page, totalPages, basePath, searchParams = {} }: PaginationProps) {
  const previousDisabled = page <= 1;
  const nextDisabled = page >= totalPages;
  const itemClass = "inline-flex min-h-8 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-300";
  const enabledClass = "border-signal/25 bg-signal/5 text-white hover:border-signal/55 hover:bg-signal/10 hover:text-signal";
  const disabledClass = "pointer-events-none border-white/10 bg-white/[0.03] text-white/35";

  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:flex-row">
      {previousDisabled ? (
        <span className={cn(itemClass, disabledClass)}>上一页</span>
      ) : (
        <Link href={buildHref(basePath, searchParams, page - 1)} className={cn(itemClass, enabledClass)}>
          上一页
        </Link>
      )}
      <p className="font-mono text-xs uppercase tracking-widest text-stardust">
        Page <span className="text-white">{page}</span> / <span className="text-white">{totalPages}</span>
      </p>
      {nextDisabled ? (
        <span className={cn(itemClass, disabledClass)}>下一页</span>
      ) : (
        <Link href={buildHref(basePath, searchParams, page + 1)} className={cn(itemClass, enabledClass)}>
          下一页
        </Link>
      )}
    </div>
  );
}
