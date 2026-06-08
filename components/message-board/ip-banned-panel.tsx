type IpBannedPanelProps = {
  ip: string | null;
  message: string;
};

export function IpBannedPanel({ ip, message }: IpBannedPanelProps) {
  return (
    <div className="sci-panel relative overflow-hidden rounded-2xl border border-red-500/30 bg-red-500/[0.06] p-8 text-center shadow-card backdrop-blur-lg">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,113,113,0.18),transparent_55%)]" aria-hidden />
      <div className="relative mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-red-300">Access Blocked</p>
        <h2 className="mt-4 font-heading text-2xl font-bold text-white md:text-4xl">访问受限</h2>
        <p className="mt-4 text-sm leading-relaxed text-red-100 md:text-base">{message}</p>
        {ip ? <p className="mt-5 font-mono text-xs text-red-200/80">当前 IP：{ip}</p> : null}
      </div>
    </div>
  );
}
