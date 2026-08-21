"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

const PIN_THRESHOLD = 80;

type Item = { id: string; senderId: string };

type Options<T extends Item> = {
  items: T[] | undefined;
  resetKey: string;
  currentUserId: string;
};

export const useAutoScroll = <T extends Item>({
  items,
  resetKey,
  currentUserId,
}: Options<T>) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const [isPinned, setIsPinned] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);

  const pinned = useRef(true);

  const metrics = useRef({ scrollTop: 0, scrollHeight: 0 });
  const previous = useRef({ key: "", firstId: "", length: 0 });

  const syncPinned = useCallback((next: boolean) => {
    if (next === pinned.current) return;
    pinned.current = next;
    setIsPinned(next);
  }, []);

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const el = viewportRef.current;
      if (!el) return;
      el.scrollTo({
        top: el.scrollHeight,
        behavior: smooth && !reducedMotion ? "smooth" : "auto",
      });
      syncPinned(true);
      setUnseenCount(0);
    },
    [reducedMotion, syncPinned],
  );

  const handleScroll = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;

    metrics.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    };

    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= PIN_THRESHOLD;
    syncPinned(atBottom);
    if (atBottom) setUnseenCount(0);
  }, [syncPinned]);

  const captureAnchor = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    metrics.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    };
  }, []);

  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el || !items) return;

    const first = items[0]?.id ?? "";
    const prev = previous.current;

    let scrollPending = false;

    if (prev.key !== resetKey) {
      el.scrollTop = el.scrollHeight;
      syncPinned(true);
      setUnseenCount(0);
    } else if (items.length > prev.length) {
      if (first !== prev.firstId && prev.firstId) {
        el.scrollTop =
          el.scrollHeight -
          metrics.current.scrollHeight +
          metrics.current.scrollTop;
      } else {
        const appended = items.slice(prev.length);
        const mine = appended.some((item) => item.senderId === currentUserId);

        const grew = Math.max(
          0,
          el.scrollHeight - metrics.current.scrollHeight,
        );
        const distanceBefore =
          el.scrollHeight - grew - el.scrollTop - el.clientHeight;

        if (mine || distanceBefore <= PIN_THRESHOLD) {
          el.scrollTo({
            top: el.scrollHeight,
            behavior: reducedMotion ? "auto" : "smooth",
          });
          scrollPending = !reducedMotion;
          setUnseenCount(0);
        } else {
          setUnseenCount((count) => count + appended.length);
        }
      }
    }

    previous.current = { key: resetKey, firstId: first, length: items.length };
    metrics.current = {
      scrollTop: el.scrollTop,
      scrollHeight: el.scrollHeight,
    };

    if (!scrollPending) {
      syncPinned(
        el.scrollHeight - el.scrollTop - el.clientHeight <= PIN_THRESHOLD,
      );
    }
  }, [items, resetKey, currentUserId, reducedMotion, syncPinned]);

  return {
    viewportRef,
    onScroll: handleScroll,
    isPinned,
    unseenCount,
    scrollToBottom,
    captureAnchor,
  };
};
