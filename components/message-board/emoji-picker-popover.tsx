"use client";

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import EmojiPicker, { EmojiStyle, Theme, type EmojiClickData } from "emoji-picker-react";
import { OverlayScrollbars } from "overlayscrollbars";
import { customScrollbarOptions } from "@/components/ui/scroll-area";

const PICKER_HEIGHT = 360;
const PICKER_GAP = 8;
const PICKER_MIN_WIDTH = 300;

type Position = {
  top: number;
  left: number;
  width: number;
  placement: "bottom" | "top";
};

/**
 * 浮层 emoji 选择器：portal 到 body 用 fixed 定位，
 * 不占用 anchor 容器的高度，避免把弹窗顶高。
 *
 * 同时给 emoji-picker-react 的 .epr-body 挂 OverlayScrollbars，
 * 用 elements.viewport === target 模式保留原生 scroll 行为，
 * 这样 picker 内部的分类跳转、搜索定位仍然正常工作。
 */
export function EmojiPickerPopover({
  open,
  anchorRef,
  onClose,
  onEmojiClick,
}: {
  open: boolean;
  anchorRef: RefObject<HTMLElement>;
  onClose: () => void;
  onEmojiClick: (data: EmojiClickData) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  // 计算浮层位置：默认在 anchor 下方，下方空间不够则翻到上方。
  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - rect.bottom - PICKER_GAP;
      const spaceAbove = rect.top - PICKER_GAP;
      const placement: "bottom" | "top" =
        spaceBelow >= PICKER_HEIGHT + 60 || spaceBelow >= spaceAbove ? "bottom" : "top";
      const width = Math.max(rect.width, PICKER_MIN_WIDTH);
      const left = Math.min(
        Math.max(rect.left, 8),
        Math.max(8, window.innerWidth - width - 8),
      );
      const top = placement === "bottom" ? rect.bottom + PICKER_GAP : rect.top - PICKER_GAP - PICKER_HEIGHT - 60;
      setPosition({ top, left, width, placement });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, anchorRef]);

  // 点击浮层外部 / 按 Esc 关闭。
  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!popoverRef.current) return;
      const target = event.target as Node;
      if (popoverRef.current.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, anchorRef, onClose]);

  // picker 渲染完后把 .epr-body 接管给 OverlayScrollbars。
  // viewport === target 让原生 scroll 行为留在 .epr-body 上，
  // emoji-picker-react 内部的 scrollTop 读写和 scroll 事件都还能用。
  useEffect(() => {
    if (!open || !popoverRef.current) return;
    let instance: OverlayScrollbars | null = null;
    const root = popoverRef.current;

    const attach = () => {
      const body = root.querySelector<HTMLElement>(".epr-body");
      if (!body) return false;
      if (OverlayScrollbars.valid(OverlayScrollbars(body))) return true;
      instance = OverlayScrollbars(
        { target: body, elements: { viewport: body } },
        customScrollbarOptions,
      );
      return true;
    };

    if (attach()) {
      return () => {
        instance?.destroy();
      };
    }

    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect();
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      instance?.destroy();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={
        position
          ? {
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              zIndex: 60,
            }
          : { position: "fixed", visibility: "hidden", top: 0, left: 0 }
      }
      className="rounded-2xl border border-signal/15 bg-[#050812] p-2 shadow-[0_18px_60px_-18px_rgba(34,211,238,0.5)]"
    >
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        theme={Theme.DARK}
        emojiStyle={EmojiStyle.NATIVE}
        width="100%"
        height={PICKER_HEIGHT}
        lazyLoadEmojis
        searchPlaceHolder="搜索 emoji"
        previewConfig={{ showPreview: false }}
        skinTonesDisabled
      />
    </div>,
    document.body,
  );
}
