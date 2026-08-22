"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};

export function useMounted(): boolean {
  return useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );
}
