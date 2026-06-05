import { cn } from "@/lib/utils";

export function Badge({ children, live, className }: { children: React.ReactNode; live?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-bitcoin/30 bg-bitcoin/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-bitcoin", className)}>
      {live ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
