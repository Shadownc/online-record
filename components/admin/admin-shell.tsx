"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Menu, X, LayoutDashboard, MessageSquare, Ban, AlertTriangle, Settings, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/admin/logout-button";
import { SciFiBackground } from "@/components/ui/sci-fi-background";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/messages", label: "留言管理", icon: MessageSquare },
  { href: "/admin/banned-ips", label: "封禁 IP", icon: Ban },
  { href: "/admin/blocked-words", label: "敏感词", icon: AlertTriangle },
  { href: "/admin/settings", label: "系统设置", icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <main className="relative min-h-screen overflow-hidden bg-void text-white">
      <SciFiBackground variant="admin" density="low" />

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-white/10 bg-void/95 backdrop-blur-xl transition-all duration-300",
          sidebarOpen ? "w-64" : "w-16",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className={cn("flex items-center border-b border-white/10 p-5", !sidebarOpen && "justify-center p-4")}>
          {sidebarOpen ? (
            <div className="flex-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Admin Node</p>
              <h1 className="mt-1 font-heading text-base font-bold text-white">控制台</h1>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white transition hover:bg-white/5 lg:hidden"
            aria-label="关闭菜单"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="后台导航">
          <Link
            href="/"
            className={cn(
              "mb-2 flex items-center gap-3 rounded-lg border border-signal/30 bg-signal/10 px-4 py-2.5 text-sm font-medium text-signal transition hover:bg-signal/15",
              !sidebarOpen && "justify-center px-2",
            )}
            onClick={() => setMobileOpen(false)}
            title={!sidebarOpen ? "返回首页" : undefined}
          >
            <Home className="h-4 w-4 shrink-0" />
            {sidebarOpen && "返回首页"}
          </Link>

          <div className="mt-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  title={!sidebarOpen ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition",
                    isActive
                      ? "bg-signal/15 text-signal"
                      : "text-white/80 hover:bg-white/5 hover:text-white",
                    !sidebarOpen && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {sidebarOpen && item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-3">
          {sidebarOpen ? (
            <LogoutButton className="w-full rounded-lg border-2 border-white/20 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:border-signal/40 hover:bg-signal/10" />
          ) : (
            <LogoutButton className="flex w-full items-center justify-center rounded-lg border-2 border-white/20 bg-transparent px-2 py-2.5 text-sm font-semibold text-white transition hover:border-signal/40 hover:bg-signal/10" iconOnly />
          )}
        </div>

        {/* PC端收起按钮 */}
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden border-t border-white/10 p-3 text-white/60 transition hover:bg-white/5 hover:text-white lg:block"
          aria-label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
        >
          <ChevronLeft className={cn("h-5 w-5 transition-transform", !sidebarOpen && "rotate-180")} />
        </button>
      </aside>

      {/* 主内容区 */}
      <div className={cn("transition-all duration-300", sidebarOpen ? "lg:pl-64" : "lg:pl-16")}>
        {/* 顶部栏 */}
        <header className="sticky top-0 z-10 border-b border-white/10 bg-void/80 backdrop-blur-xl lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-signal">Admin Node</p>
              <h1 className="mt-0.5 font-heading text-sm font-bold text-white">控制台</h1>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 text-white transition hover:border-signal/40 hover:bg-signal/10"
              aria-label="打开菜单"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* 内容 */}
        <div className="p-6 md:p-8">{children}</div>
      </div>
    </main>
  );
}
