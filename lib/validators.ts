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
