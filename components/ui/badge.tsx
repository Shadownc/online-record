import { cn } from "@/lib/utils";

export function Badge({ children, live, className }: { children: React.ReactNode; live?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full border border-signal/30 bg-signal/10 px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-signal", className)}>
      {live ? (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-node-ping-slow rounded-full bg-signal opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-signal glow-node" />
        </span>
      ) : null}
      {children}
    </span>
  );
}
