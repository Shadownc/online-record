import { z } from "zod";

// 长度上限的兜底默认值，与 SiteSetting 的 @default 保持一致。
export const DEFAULT_USERNAME_MAX = 24;
export const DEFAULT_CONTENT_MAX = 800;

const usernamePattern = /^[\p{L}\p{N}_\-\s]+$/u;

/** 后台批量删除按用户名匹配时复用，长度用默认上限即可。 */
export const usernameSchema = z
  .string()
  .trim()
  .min(2, "用户名至少 2 个字符")
  .max(DEFAULT_USERNAME_MAX, `用户名最多 ${DEFAULT_USERNAME_MAX} 个字符`)
  .regex(usernamePattern, "用户名只能包含文字、数字、空格、_ 或 -");

/** 按站点配置的长度上限动态生成留言校验 schema。 */
export function createMessageSchema(limits: { usernameMaxLength: number; contentMaxLength: number }) {
  return z.object({
    username: z
      .string()
      .trim()
      .min(2, "用户名至少 2 个字符")
      .max(limits.usernameMaxLength, `用户名最多 ${limits.usernameMaxLength} 个字符`)
      .regex(usernamePattern, "用户名只能包含文字、数字、空格、_ 或 -"),
    content: z
      .string()
      .trim()
      .min(1, "留言不能为空")
      .max(limits.contentMaxLength, `留言最多 ${limits.contentMaxLength} 个字符`),
  });
}

export const settingsSchema = z
  .object({
    messageEnabled: z.boolean(),
    openStartTime: z.string().datetime().nullable().optional(),
    openEndTime: z.string().datetime().nullable().optional(),
    closedNotice: z.string().trim().min(1, "关闭提示不能为空").max(200, "关闭提示最多 200 个字符"),
    usernameMaxLength: z.coerce.number().int("必须是整数").min(2, "用户名上限至少 2").max(40, "用户名上限最多 40"),
    contentMaxLength: z.coerce.number().int("必须是整数").min(1, "留言上限至少 1").max(5000, "留言上限最多 5000"),
    rateLimitSeconds: z.coerce.number().int("必须是整数").min(0, "频率间隔不能为负").max(3600, "频率间隔最多 3600 秒"),
    announcement: z.string().trim().max(300, "公告最多 300 个字符").default(""),
    announcementEnabled: z.boolean().default(false),
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

export const messageBulkActionSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "请至少选择一条留言").max(200, "单次最多操作 200 条"),
  // hide=隐藏 show=恢复可见 delete=软删除 restore=从回收站恢复 purge=永久删除
  action: z.enum(["hide", "show", "delete", "restore", "purge"], {
    errorMap: () => ({ message: "操作类型无效" }),
  }),
});

export const blockedWordCreateSchema = z.object({
  word: z.string().trim().min(1, "请输入敏感词").max(100, "敏感词最多 100 个字符"),
  action: z.enum(["reject", "hide"], { errorMap: () => ({ message: "处理方式无效" }) }).default("reject"),
});

export const blockedWordUpdateSchema = z.object({
  action: z.enum(["reject", "hide"], { errorMap: () => ({ message: "处理方式无效" }) }),
});
