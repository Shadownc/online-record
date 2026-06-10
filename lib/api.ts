import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";

/**
 * 统一的 API 错误。在 route handler 内任意位置 throw，
 * 由 route() 包装器捕获并转换为标准 JSON 错误响应。
 */
export class ApiError extends Error {
  status: number;
  extra?: Record<string, unknown>;

  constructor(message: string, status = 400, extra?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.extra = extra;
  }
}

/** 成功响应。init 可传状态码或完整 ResponseInit。 */
export function ok<T>(data: T, init?: number | ResponseInit) {
  const responseInit = typeof init === "number" ? { status: init } : init;
  return NextResponse.json(data, responseInit);
}

/** 错误响应。extra 会被合并进响应体（例如 { banned: true }）。 */
export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** 安全解析请求体，失败返回 null（与各 route 现有写法一致）。 */
export async function readJson(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

/** 用 zod schema 校验数据，失败时 throw ApiError(400) 带首条错误信息。 */
export function parse<S extends ZodTypeAny>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(result.error.issues[0]?.message ?? "提交内容无效", 400);
  }
  return result.data;
}

/** redirect()/notFound() 会 throw 带 digest 的特殊错误，包装器必须原样抛出。 */
function isNextControlFlowError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("digest" in error)) return false;
  const digest = (error as { digest: unknown }).digest;
  return typeof digest === "string" && (digest.startsWith("NEXT_REDIRECT") || digest === "NEXT_NOT_FOUND");
}

type RouteHandler<Ctx> = (request: Request, context: Ctx) => Promise<Response> | Response;

/**
 * 包装 route handler，统一处理异常：
 * - ApiError → 对应状态码 + 信息
 * - ZodError → 400 + 首条校验信息
 * - 其它 → 记录日志并返回 500
 * Next 的 redirect/notFound 控制流错误会原样抛出。
 */
export function route<Ctx = unknown>(handler: RouteHandler<Ctx>): RouteHandler<Ctx> {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      if (isNextControlFlowError(error)) throw error;
      if (error instanceof ApiError) {
        return fail(error.message, error.status, error.extra);
      }
      if (error instanceof ZodError) {
        return fail(error.issues[0]?.message ?? "提交内容无效", 400);
      }
      console.error("[api] unhandled error", error);
      return fail("服务器内部错误", 500);
    }
  };
}
