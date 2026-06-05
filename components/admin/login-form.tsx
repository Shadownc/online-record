"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "登录失败");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="管理员用户名" autoComplete="username" />
      <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="管理员密码" type="password" autoComplete="current-password" />
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <Button type="submit" className="w-full" disabled={loading}>{loading ? "正在验证..." : "进入控制台"}</Button>
    </form>
  );
}
