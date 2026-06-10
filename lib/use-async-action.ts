"use client";

import { useCallback, useRef, useState } from "react";

type Options<Result> = {
  onSuccess?: (result: Result) => void;
  onError?: (error: Error) => void;
  /** 成功后写入 status 的文案，例如 "设置已保存"。 */
  successMessage?: string;
};

/**
 * 统一表单/异步操作的 loading / error / status 状态。
 *
 * 用法：
 *   const save = useAsyncAction(
 *     async () => apiFetch("/api/admin/settings", { method: "PATCH", body }),
 *     { successMessage: "设置已保存", onSuccess: () => router.refresh() },
 *   );
 *   <Button onClick={() => save.run()} disabled={save.loading}>...</Button>
 *   {save.error && <p>{save.error}</p>}
 *
 * action 与 options 通过 ref 持有，调用方无需 useCallback 包裹。
 */
export function useAsyncAction<Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>,
  options: Options<Result> = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const run = useCallback(async (...args: Args): Promise<Result | undefined> => {
    setLoading(true);
    setError("");
    setStatus("");
    try {
      const result = await actionRef.current(...args);
      const opts = optionsRef.current;
      if (opts.successMessage) setStatus(opts.successMessage);
      opts.onSuccess?.(result);
      return result;
    } catch (err) {
      const normalized = err instanceof Error ? err : new Error("操作失败");
      setError(normalized.message);
      optionsRef.current.onError?.(normalized);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError("");
    setStatus("");
  }, []);

  return { run, loading, error, status, setError, setStatus, reset };
}
