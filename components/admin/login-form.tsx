"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api-client";
import { useAsyncAction } from "@/lib/use-async-action";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = useAsyncAction(
    () => apiFetch("/api/admin/login", { method: "POST", body: { username, password } }),
    {
      onSuccess: () => {
        router.replace("/admin");
        router.refresh();
      },
    },
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        login.run();
      }}
      className="mt-8 space-y-5"
    >
      <Input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="管理员用户名" autoComplete="username" />
      <Input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="管理员密码" type="password" autoComplete="current-password" />
      {login.error ? <p className="text-sm text-red-300">{login.error}</p> : null}
      <Button type="submit" className="w-full" disabled={login.loading}>{login.loading ? "正在验证..." : "进入控制台"}</Button>
    </form>
  );
}
