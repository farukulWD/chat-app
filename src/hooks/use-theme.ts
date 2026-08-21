"use client";

import { useSyncExternalStore } from "react";
import {
  getServerThemeSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";

export const useTheme = (): {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (next: Theme) => void;
} => {
  const snapshot = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  return { ...snapshot, setTheme };
};
