"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={logout} title={iconOnly ? "退出登录" : undefined}>
      {iconOnly ? <LogOut className="h-4 w-4" /> : "退出"}
    </button>
  );
}
