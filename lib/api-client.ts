export type ApiClientError = Error & { status?: number; data?: unknown };

type FetchInit = Omit<RequestInit, "body"> & { body?: unknown };

/**
 * 前端统一 fetch 封装：
 * - 自动序列化 JSON body 并补上 Content-Type（FormData 除外）
 * - 解析响应 JSON
 * - 非 2xx 时 throw Error，message 取响应体的 error 字段，并挂上 status / data
 *
 * 用法：apiFetch("/api/messages", { method: "POST", body: { username, content } })
 */
export async function apiFetch<T = unknown>(input: RequestInfo | URL, init: FetchInit = {}): Promise<T> {
  const { body, headers, ...rest } = init;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== undefined && body !== null;

  const response = await fetch(input, {
    ...rest,
    headers: hasBody && !isFormData ? { "Content-Type": "application/json", ...headers } : headers,
    body: hasBody ? (isFormData ? (body as FormData) : JSON.stringify(body)) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : "请求失败";
    const error = new Error(message) as ApiClientError;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}
