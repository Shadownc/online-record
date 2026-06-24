# 更新日志

本文档记录 `online-record` 留言墙项目的重要功能更新与优化。

## 2026-06-24 · Modal 滚动修复与 Emoji 选择器浮层化

### 说明

本次更新解决了留言弹窗的两个体验问题：emoji 展开时内容超出无法滚动，以及 emoji 选择器滚动条未使用统一的 OverlayScrollbars 主题。

---

### Modal 滚动容器修复

**问题**：emoji 展开时内容超出弹窗边界，但弹窗内部无法滚动。

**原因**：Modal 外层用 `max-h-[90vh]` 但未设固定 `height`，内部 ScrollArea 的 `h-full` (CSS `height: 100%`) 在父级 height 为 `auto` 时无法解析出具体值，OverlayScrollbars 检测不到 overflow 就不显示滚动条。

**解决方案**：
- 外层容器改为 `flex max-h-[90vh] flex-col` 布局
- ScrollArea 改为 `min-h-0 flex-1`，通过 flex 子元素获得明确高度
- emoji 展开时内容超出能正常触发滚动

涉及文件：
- `components/ui/modal.tsx`

---

### Emoji 选择器浮层化

**问题**：原来 emoji 选择器内嵌在表单中，展开时会把整个 MessageForm 卡片撑高，进而撑高 Modal，即便 Modal 能滚动，体验也是"需要滚很长"。

**解决方案**：
- 新建 `EmojiPickerPopover` 组件，使用 `createPortal` + `position: fixed` 渲染到 `document.body`
- 浮层定位逻辑：
  - 默认显示在触发按钮下方
  - 下方空间不够时自动翻到上方
  - 监听 `resize` / `scroll` 事件自动更新位置
  - 点击外部或按 `Esc` 关闭
- emoji 选择器完全脱离文档流，不占用父级高度

涉及文件：
- `components/message-board/emoji-picker-popover.tsx` — 新建浮层组件
- `components/message-board/message-form.tsx` — 替换内嵌 EmojiPicker 为 EmojiPickerPopover

---

### Emoji 选择器滚动条统一为 OverlayScrollbars

**挑战**：emoji-picker-react 内部的分类跳转和搜索定位是直接对 `.epr-body` 元素写 `scrollTop` 实现的。OverlayScrollbars 默认会把 host 设为 `overflow: hidden`，scroll 实际发生在内部生成的 viewport 子节点上，这会让 `scrollTop` 读写失效。

**解决方案**：
- 使用 OverlayScrollbars 2.x 的 `elements.viewport = target` 模式
- 配置为 `OverlayScrollbars({ target: body, elements: { viewport: body } }, options)`
- 让 `.epr-body` 本身就是 viewport，不生成额外子节点
- scroll 事件和 `scrollTop` 读写仍作用在原 DOM 元素上
- emoji-picker-react 的分类跳转、搜索定位逻辑不受影响
- 只接管滚动条 UI，应用 `os-theme-online-record` 主题

**实现细节**：
- 用 `MutationObserver` 监听 emoji picker 渲染完成
- 找到 `.epr-body` 元素后初始化 OverlayScrollbars
- 浮层关闭时销毁 OverlayScrollbars 实例
- 移除 `app/globals.css` 中给 `.epr-body` 写的 CSS 自定义滚动条样式

涉及文件：
- `components/message-board/emoji-picker-popover.tsx` — OverlayScrollbars 集成逻辑
- `app/globals.css` — 清理旧 CSS 滚动条样式

---

### 验证

- ✅ TypeScript 类型检查通过
- ✅ Modal 内容超出时能正常滚动
- ✅ Emoji 选择器浮层定位正确，不占用弹窗高度
- ✅ Emoji 选择器滚动条使用 OverlayScrollbars，视觉与全局一致
- ✅ 分类跳转和搜索定位功能正常

---

## 2026-06-10 · 留言详情页优化与分享图美化

### 留言详情页布局优化

- 扩大内容区域宽度：max-w-3xl → max-w-5xl
- 减少页面和卡片内边距，提升内容展示空间利用率
- 优化移动端和桌面端的视觉平衡

### Modal 组件渲染优化

- **修复弹窗被父容器遮挡问题**
- 使用 `createPortal` 将 Modal 渲染到 `document.body` 层级
- 避免被父容器的 `overflow-hidden` 裁剪
- 确保分享图预览弹窗能正常显示在页面中央

### 分享图视觉升级

全面重构分享图生成效果，提升科幻赛博风格：

#### 背景优化
- 深色渐变背景（#0a0e1a → #050812）
- 网格背景纹理（30px 间距，低透明度）
- 左上角青色光晕（rgba(34,211,238,0.15)）
- 右下角紫色光晕（rgba(167,139,250,0.12)）

#### 边框与装饰
- 双层主边框（外层高亮，内层辅助）
- 顶部渐变装饰条（青色渐变消失）
- 标签背景块（半透明青色）
- 昵称下渐变下划线（青紫渐变）

#### 文字优化
- 使用系统字体栈（-apple-system, BlinkMacSystemFont, 'Segoe UI'）
- 内容文字增加发光效果（shadowBlur: 20）
- 优化字号和行高（20px / 34px lineHeight）
- 改进颜色对比度和可读性

#### 分隔与布局
- 渐变分隔线（中间高亮，两端消失）
- 底部站点名独立背景块（半透明紫色）
- 优化各元素间距和垂直韵律

### 技术细节

- Canvas 渲染保持 2x 倍率，确保高清输出
- 支持中英文混排自动换行
- 动态计算画布高度适配不同长度内容
- 使用 Blob + URL.createObjectURL 生成预览

---

## 2026-06-10 · 后台管理界面全面优化

### 说明

本次更新专注于后台管理界面的视觉体验与交互优化，统一了设计语言，优化了移动端适配，提升了操作效率。

---

## 界面优化

### 统一设计组件

- 新增 `PageHeader` 统一页面头部组件
- 创建自定义 `Input`、`Select`、`CustomSelect` 组件
- 所有原生表单控件替换为自定义深色主题组件
- 统一的圆角、边框、hover/focus 效果
- 渐变高亮与毛玻璃效果

### 概览页面优化

- 更大的统计卡片图标
- 优化卡片 hover 过渡动画
- 改进空状态提示样式
- 美化数据标签展示

### 留言管理优化

- 简化页面头部，节省空间
- 折叠式筛选面板，默认展开可收起
- 自定义日期选择器（使用 Portal 渲染，避免遮挡）
- 自定义下拉选择器（美观的深色主题）
- 优化表格状态标签（更紧凑，移动端不换行）
- 响应式操作按钮（移动端折叠为下拉菜单）

### 系统设置优化

- 美化开关样式（现代卡片式设计）
- 优化表单布局和间距
- 改进错误/成功提示展示
- 增强当前状态可读性

### 敏感词与封禁 IP 管理

- 统一页面头部样式
- 添加统计信息展示
- 优化表单和表格布局

---

## 交互改进

### 日期选择器

- 自定义日历面板（替代原生 date input）
- 使用 React Portal 渲染到 body，避免被容器遮挡
- 月份切换按钮
- 渐变高亮选中日期
- 点击外部自动关闭
- 支持快速清空

### 下拉选择

- 自定义下拉组件替代原生 select
- 选中项显示 ✓ 标记
- 展开时箭头旋转动画
- 深色主题配色
- 点击外部自动关闭

### 移动端适配

- 留言表格操作按钮折叠为下拉菜单
- 主要操作在大屏显示，次要操作在菜单中
- 移动端只显示"更多"按钮
- 状态标签紧凑布局，避免换行

---

## 新增组件

### UI 组件

- `components/ui/input.tsx` - 自定义输入框
- `components/ui/custom-select.tsx` - 自定义下拉选择
- `components/ui/date-picker.tsx` - 自定义日期选择器
- `components/admin/page-header.tsx` - 统一页面头部

### 技术亮点

- **React Portal**: 日历面板渲染到 body，完全避免 overflow 限制
- **动态定位**: 根据输入框位置动态计算日历显示位置
- **点击外部关闭**: 使用 ref + 事件监听实现
- **响应式设计**: Tailwind 断点实现多端适配

---

## 验证

- ✅ 已通过 ESLint 检查
- ✅ 所有页面样式统一
- ✅ 移动端和桌面端测试通过
- ✅ 日期选择器无遮挡问题

---

## 2026-06-10 · 留言墙功能增强与体验优化

### 说明

本轮更新围绕「留言互动、后台管理、安全风控、前台体验、性能优化」完成了一整批功能增强。项目从基础留言墙升级为具备点赞互动、详情分享、审核风控、后台批量管理、体验反馈与性能优化的完整留言系统。

> 备注：`6 + 6 = 12`。

---

## 新增功能

### 留言点赞 / 共鸣

- 新增 `MessageReaction` 数据模型。
- 支持访客对留言进行共鸣点赞。
- 按 IP 去重，同一来源重复点击可取消共鸣。
- 前台留言列表和留言详情页展示共鸣数量。
- 支持当前访客已点赞状态展示。

### 留言详情页

- 新增 `/messages/[id]` 留言详情页。
- 支持展示单条留言完整内容、发布时间和共鸣数量。
- 不存在、隐藏或已删除的留言会进入 404 处理。
- 新增分享元信息，方便外部传播。

### 分享海报 / 复制链接

- 新增留言分享操作组件。
- 支持一键复制留言详情页链接。
- 支持客户端 Canvas 生成分享图并下载。
- 分享图包含昵称、留言内容、发布时间和站点名称。
- 支持中英文混排自动换行。
- 无需新增服务端图片生成依赖。

### 投稿前预览

- 留言发布流程改为「编辑 → 预览 → 确认发送」。
- 发布前可预览留言卡片效果。
- 预览态支持返回继续编辑。
- 减少误发和内容排版不确定性。

### 随机漫游模式

- 在留言列表中新增「漫游模式」。
- 开启后每隔数秒自动刷新随机留言。
- 支持开始 / 停止漫游。
- 漫游时采用静默刷新，避免列表频繁闪烁 loading 状态。

### 开放 / 关闭倒计时

- 新增通用倒计时组件。
- 留言未开放时展示「距离开放还有多久」。
- 留言开放中且配置了结束时间时展示「距离关闭还有多久」。
- 倒计时结束后自动刷新留言开放状态。

### 滚动公告栏

- 后台可配置首页公告内容。
- 前台以滚动公告形式展示。
- 公告开关关闭时不暴露草稿内容。

---

## 后台管理增强

### 敏感词过滤

- 新增敏感词配置能力。
- 支持两种处理方式：
  - 拒绝发布
  - 提交后隐藏，等待审核
- 后台可管理敏感词列表。
- 敏感词匹配支持大小写和空白归一化。
- 敏感词列表带缓存，更新后自动失效。

### 回收站 / 恢复删除留言

- 后台留言软删除后进入回收站。
- 支持从回收站恢复留言。
- 支持永久删除留言。
- 永久删除会同步清理关联共鸣记录。

### 批量操作优化

- 后台留言列表支持多选。
- 支持全选当前页。
- 正常列表支持批量：
  - 隐藏
  - 恢复显示
  - 软删除
- 回收站支持批量：
  - 恢复
  - 永久删除
- 新增批量操作 API。

### 后台筛选增强

- 留言管理支持关键词筛选。
- 支持按 IP 筛选。
- 支持按可见状态筛选。
- 支持按日期范围筛选。
- 支持按时间顺序排序。
- 筛选条件会在分页时保留。

---

## 安全与风控

### 留言策略配置化

- 支持后台配置用户名最大长度。
- 支持后台配置留言最大长度。
- 支持后台配置提交频率限制。
- 前台表单会根据后端配置动态限制输入长度。

### 防重复提交

- 增强提交限制逻辑。
- 防止短时间内重复提交相同内容。
- 与频率限制配合提升抗刷能力。

### API 错误处理统一化

- 新增统一 API 工具：
  - `route()`
  - `ok()`
  - `fail()`
  - `parse()`
  - `ApiError`
- API 返回结构更一致。
- Zod 校验错误和业务错误统一处理。
- 保留 Next.js redirect / notFound 控制流错误。

---

## 前端体验优化

### 表单请求状态统一

- 新增 `apiFetch()` 前端请求封装。
- 新增 `useAsyncAction()` 统一管理：
  - loading
  - error
  - status
  - 成功回调
  - 错误回调
- 减少各表单重复状态逻辑。

### Toast 提交反馈

- 新增全局 `ToastProvider` 与 `useToast()`。
- 支持 success、error、info 三类提示。
- 支持自动消失和手动关闭。
- 留言成功、待审核、失败时均有明确反馈。

### 表单错误提示优化

- 留言内容错误显示在输入框下方。
- 用户名错误显示在用户名输入框下方。
- 错误字段增加红色边框和 `aria-invalid`。
- 用户重新输入后自动清除字段错误。

### 骨架屏加载状态

- 首页留言区 loading 文案替换为卡片骨架屏。
- 骨架屏结构与真实留言卡片布局一致。
- 加载体验更平滑，减少页面跳变。

### 移动端基础优化

- 新增 viewport 配置：
  - `width=device-width`
  - `initialScale=1`
  - `maximumScale=5`
  - `themeColor=#02040a`
- 确保页面按设备真实宽度渲染。
- 保留用户缩放能力。
- 设置移动端浏览器主题色。

---

## 性能优化

### Prisma 随机查询优化

- 优化随机留言查询。
- 原实现使用 `ORDER BY RAND()`，大数据量时会对全表排序。
- 新增 `pickRandomMessageIds()`：
  - 先用概率闸门 `RAND() < threshold` 筛选部分记录
  - 再对小集合随机排序
  - 最后按随机 ID 顺序恢复结果
- 在数据量较大时减少 MySQL 排序压力。
- 数据量较小时自动退化为原始随机行为，保证结果正确。

---

## 数据模型变更

新增或扩展的数据模型包括：

- `MessageReaction`：记录留言共鸣点赞。
- `BlockedWord`：记录敏感词及处理方式。
- `SiteSetting` 增加：
  - `usernameMaxLength`
  - `contentMaxLength`
  - `rateLimitSeconds`
  - `announcement`
  - `announcementEnabled`

---

## 新增 / 重点文件

### API 与工具

- `lib/api.ts`
- `lib/api-client.ts`
- `lib/use-async-action.ts`
- `lib/random-messages.ts`
- `lib/blocked-words.ts`

### 前台组件

- `components/message-board/reaction-button.tsx`
- `components/message-board/share-actions.tsx`
- `components/message-board/countdown.tsx`
- `components/message-board/message-list-skeleton.tsx`
- `components/message-board/announcement-bar.tsx`

### 后台组件

- `components/admin/blocked-word-manager.tsx`
- `components/admin/message-filter.tsx`

### 页面与接口

- `app/messages/[id]/page.tsx`
- `app/api/messages/[id]/react/route.ts`
- `app/admin/blocked-words/page.tsx`
- `app/api/admin/blocked-words/route.ts`
- `app/api/admin/blocked-words/[id]/route.ts`
- `app/api/admin/messages/bulk/route.ts`

---

## 验证

- 已通过 TypeScript 类型检查：`npx tsc --noEmit`。
- 数据库结构已通过 Prisma 同步。

---