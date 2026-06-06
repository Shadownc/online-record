"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { useOverlayScrollbars } from "overlayscrollbars-react";
import type { PartialOptions } from "overlayscrollbars";
import { cn } from "@/lib/utils";

export const customScrollbarOptions: PartialOptions = {
  scrollbars: {
    theme: "os-theme-online-record",
    visibility: "auto",
    autoHide: "leave",
    autoHideDelay: 500,
    autoHideSuspend: false,
    dragScroll: true,
    clickScroll: false,
  },
};

type ScrollAreaProps = HTMLAttributes<HTMLDivElement> & {
  options?: PartialOptions;
};

export function ScrollArea({ className, options, children, ...props }: ScrollAreaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [initialize] = useOverlayScrollbars({
    options: options ?? customScrollbarOptions,
    defer: true,
  });

  useEffect(() => {
    if (ref.current) initialize(ref.current);
  }, [initialize]);

  return (
    <div ref={ref} className={cn("scrollbar-host", className)} {...props}>
      {children}
    </div>
  );
}
