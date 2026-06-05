"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/logout-button";

const navItems = [
  { href: "/admin", label: "概览" },
  { href: "/admin/messages", label: "留言" },
  { href: "/admin/settings", label: "设置" },
];

const navClass =
  "inline-flex min-h-9 items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white transition-all duration-300 focus-ring hover:bg-white/10 hover:text-bitcoin";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" aria-hidden />
      <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-bitcoin/10 blur-[140px]" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-8 md:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/40 p-5 backdrop-blur-lg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-bitcoin">Admin Console</p>
            <h1 className="mt-1 font-heading text-xl font-bold text-white md:text-2xl">Online Record 控制台</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2" aria-label="后台导航">
            <Link href="/" className={cn(navClass, "border border-bitcoin/30 bg-bitcoin/10 text-bitcoin hover:bg-bitcoin/15")}>
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
                "inline-flex min-h-9 items-center justify-center rounded-full border-2 border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:border-white hover:bg-white/10 focus-ring",
              )}
            />
          </nav>
        </header>
        {children}
      </div>
    </main>
  );
}
