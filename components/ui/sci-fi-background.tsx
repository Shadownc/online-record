import { cn } from "@/lib/utils";

type SciFiBackgroundProps = {
  variant?: "public" | "admin" | "login" | "modal";
  density?: "low" | "medium" | "high";
  className?: string;
};

const densityClass = {
  low: "opacity-35",
  medium: "opacity-50",
  high: "opacity-65",
};

const variantGlow = {
  public: "left-[8%] top-[12%] h-72 w-72 bg-signal/14 md:h-96 md:w-96",
  admin: "right-[4%] top-0 h-72 w-72 bg-signal/10 md:h-96 md:w-96",
  login: "left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-plasma/14 md:h-[30rem] md:w-[30rem]",
  modal: "right-0 top-0 h-56 w-56 bg-signal/10",
};

const nodes = [
  "left-[12%] top-[22%] h-2 w-2 bg-signal/80",
  "left-[22%] top-[68%] h-1.5 w-1.5 bg-plasma/70",
  "right-[18%] top-[30%] h-3 w-3 bg-signal/60",
  "right-[26%] bottom-[18%] h-2 w-2 bg-gold/70",
  "left-[48%] top-[14%] h-1.5 w-1.5 bg-white/70",
  "left-[62%] bottom-[28%] h-2.5 w-2.5 bg-signal/60",
];

export function SciFiBackground({ variant = "public", density = "medium", className }: SciFiBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden sci-background", className)} aria-hidden>
      <div className={cn("absolute inset-0 particle-field animate-star-drift", densityClass[density])} />
      <div className="absolute inset-0 network-lines animate-network-pulse" />
      <div className={cn("absolute rounded-full blur-[120px] animate-glow-breathe", variantGlow[variant])} />
      <div className="absolute -bottom-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-nebula/18 blur-[150px]" />
      {nodes.map((node) => (
        <span key={node} className={cn("absolute rounded-full glow-node animate-node-ping-slow", node)} />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,4,10,0.2)_52%,rgba(2,4,10,0.82)_100%)]" />
    </div>
  );
}
