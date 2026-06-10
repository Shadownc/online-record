"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomSelect } from "@/components/ui/custom-select";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

export type MessageFilterValues = {
  q?: string;
  ip?: string;
  visible?: string;
  startDate?: string;
  endDate?: string;
  order?: string;
};

/**
 * 后台留言筛选栏。URL 参数驱动（非受控表单 + FormData），
 * 提交时构造查询串导航到当前页，空值不写入 URL。
 * tab（留言列表/回收站）通过隐藏参数保留，page 重置回第一页。
 */
export function MessageFilter({ values, tab }: { values: MessageFilterValues; tab?: string }) {
  const router = useRouter();
  const basePath = "/admin/messages";
  const [startDate, setStartDate] = useState(values.startDate ?? "");
  const [endDate, setEndDate] = useState(values.endDate ?? "");
  const [visible, setVisible] = useState(values.visible ?? "");
  const [order, setOrder] = useState(values.order ?? "desc");
  const [expanded, setExpanded] = useState(true);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const key of ["q", "ip"]) {
      const value = String(form.get(key) ?? "").trim();
      if (value) params.set(key, value);
    }
    if (visible) params.set("visible", visible);
    if (order !== "desc") params.set("order", order);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (tab) params.set("tab", tab);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }

  function reset() {
    setStartDate("");
    setEndDate("");
    setVisible("");
    setOrder("desc");
    router.push(tab ? `${basePath}?tab=${tab}` : basePath);
  }

  const labelClass = "block space-y-2";
  const labelText = "block font-mono text-[11px] font-medium uppercase tracking-wider text-stardust";

  return (
    <div className="sci-panel sci-border rounded-2xl border p-6 shadow-card backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h3 className="font-heading text-lg font-semibold text-white">筛选条件</h3>
          <p className="mt-1 text-xs text-stardust">展开查看更多筛选选项</p>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-stardust transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <form onSubmit={submit} className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className={labelClass}>
              <span className={labelText}>关键词</span>
              <Input name="q" defaultValue={values.q ?? ""} placeholder="搜索用户名或内容" maxLength={100} />
            </label>
            <label className={labelClass}>
              <span className={labelText}>IP 地址</span>
              <Input name="ip" defaultValue={values.ip ?? ""} placeholder="精确匹配 IP" maxLength={64} />
            </label>
            <label className={labelClass}>
              <span className={labelText}>可见状态</span>
              <CustomSelect
                value={visible}
                onChange={setVisible}
                options={[
                  { label: "全部", value: "" },
                  { label: "仅可见", value: "visible" },
                  { label: "仅隐藏", value: "hidden" },
                ]}
              />
            </label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="relative">
              <label className={labelClass}>
                <span className={labelText}>起始日期</span>
                <DatePicker value={startDate} onChange={setStartDate} placeholder="选择起始日期" />
              </label>
            </div>
            <div className="relative">
              <label className={labelClass}>
                <span className={labelText}>结束日期</span>
                <DatePicker value={endDate} onChange={setEndDate} placeholder="选择结束日期" />
              </label>
            </div>
            <label className={labelClass}>
              <span className={labelText}>排序方式</span>
              <CustomSelect
                value={order}
                onChange={setOrder}
                options={[
                  { label: "最新优先", value: "desc" },
                  { label: "最早优先", value: "asc" },
                ]}
              />
            </label>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button type="submit" size="sm">
              <Search className="h-4 w-4" />
              筛选
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={reset}>
              <X className="h-4 w-4" />
              重置
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
