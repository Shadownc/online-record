"use client";

import { useEffect } from "react";
import { useOverlayScrollbars } from "overlayscrollbars-react";
import { customScrollbarOptions } from "@/components/ui/scroll-area";

export function AppScrollbars() {
  const [initialize] = useOverlayScrollbars({
    options: customScrollbarOptions,
    defer: true,
  });

  useEffect(() => {
    initialize(document.body);
  }, [initialize]);

  return null;
}
