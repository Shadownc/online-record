"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/logout-button";
import { SciFiBackground } from "@/components/ui/sci-fi-background";

const navItems = [
  { href: "/admin", label: "概览" },
  { href: "/admin/messages", label: "留言" },
  { href: "/admin/banned-ips", label: "封禁 IP" },
  { href: "/admin/settings", label: "设置" },
];

const navClass =
  "inline-flex min-h-8 items-center justify-center rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 focus-ring hover:border-signal/30 hover:bg-signal/10 hover:text-signal";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <SciFiBackground variant="admin" density="low" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-8">
        <header className="sci-panel sci-border mb-8 flex flex-col gap-4 rounded-2xl border p-5 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-signal">Admin Node</p>
            <h1 className="mt-1 font-heading text-lg font-bold text-white md:text-xl">Online Record 控制台</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="后台导航">
            <Link href="/" className={cn(navClass, "border border-signal/30 bg-signal/10 text-signal hover:bg-signal/15")}>
              <Home className="h-4 w-4" aria-hidden />
              返回首页
            </Link>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={navClass}>
                {item.label}
              </Link>
            ))}
            <LogoutButton
              className={cn(
                "inline-flex min-h-8 items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white transition-all duration-300 hover:border-signal/40 hover:bg-signal/10 focus-ring",
              )}
            />
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
