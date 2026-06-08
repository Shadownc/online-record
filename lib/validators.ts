import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(2, "用户名至少 2 个字符")
  .max(24, "用户名最多 24 个字符")
  .regex(/^[\p{L}\p{N}_\-\s]+$/u, "用户名只能包含文字、数字、空格、_ 或 -");

export const messageCreateSchema = z.object({
  username: usernameSchema,
  content: z.string().trim().min(1, "留言不能为空").max(800, "留言最多 800 个字符"),
});

export const settingsSchema = z
  .object({
    messageEnabled: z.boolean(),
    openStartTime: z.string().datetime().nullable().optional(),
    openEndTime: z.string().datetime().nullable().optional(),
    closedNotice: z.string().trim().min(1, "关闭提示不能为空").max(200, "关闭提示最多 200 个字符"),
  })
  .refine(
    (value) => {
      if (!value.openStartTime || !value.openEndTime) return true;
      return new Date(value.openStartTime) < new Date(value.openEndTime);
    },
    { message: "开始时间必须早于结束时间", path: ["openEndTime"] },
  );

export const loginSchema = z.object({
  username: z.string().trim().min(1, "请输入用户名"),
  password: z.string().min(1, "请输入密码"),
});

export const ipBanCreateSchema = z.object({
  ip: z.string().trim().min(1, "请输入 IP").max(64, "IP 最多 64 个字符"),
  reason: z.string().trim().max(255, "封禁原因最多 255 个字符").optional(),
});

export const messageBulkDeleteSchema = z
  .object({
    ip: z.string().trim().min(1, "请输入 IP").max(64, "IP 最多 64 个字符").optional(),
    username: usernameSchema.optional(),
  })
  .refine((value) => Boolean(value.ip) !== Boolean(value.username), {
    message: "只能选择按 IP 或用户名删除其中一种方式",
  });
