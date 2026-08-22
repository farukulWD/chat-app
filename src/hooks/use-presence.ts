"use client";

import { useSyncExternalStore } from "react";
import { useAppSelector } from "@/redux/hooks";
import { formatLastActive } from "@/lib/datetime";
import type { Presence } from "@/types/chat";

const SELF_PRESENCE: Record<string, Presence> = {
  connected: "online",
  connecting: "away",
  disconnected: "offline",
};

const SELF_LABEL: Record<string, string> = {
  connected: "Online",
  connecting: "Connecting…",
  disconnected: "Offline",
};

export function useSelfPresence(): Presence {
  const connection = useAppSelector((state) => state.chat.connection);
  return SELF_PRESENCE[connection] ?? "offline";
}

export function useSelfStatusLabel(): string {
  const connection = useAppSelector((state) => state.chat.connection);
  return SELF_LABEL[connection] ?? "Offline";
}

const TICK_MS = 60_000;

const clock = {
  now: 0,
  listeners: new Set<() => void>(),
  timer: null as ReturnType<typeof setInterval> | null,
};

const subscribeToClock = (onChange: () => void) => {
  clock.listeners.add(onChange);

  if (!clock.timer) {
    clock.now = Date.now();
    clock.timer = setInterval(() => {
      clock.now = Date.now();
      for (const listener of clock.listeners) listener();
    }, TICK_MS);
  }

  return () => {
    clock.listeners.delete(onChange);

    if (clock.listeners.size === 0 && clock.timer) {
      clearInterval(clock.timer);
      clock.timer = null;
    }
  };
};

function useCoarseNow(): number {
  return useSyncExternalStore(
    subscribeToClock,
    () => clock.now,
    () => 0,
  );
}

export function useLastActiveLabel(userId: string | undefined): string | null {
  const at = useAppSelector((state) =>
    userId ? state.chat.lastActiveAt[userId] : undefined,
  );
  const now = useCoarseNow();

  if (!at || !now) return null;

  return formatLastActive(new Date(at), new Date(now));
}
