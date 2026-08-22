"use client";

import { useEffect, useState } from "react";

const DEFAULT_DELAY = 8_000;

export function useSlowLoading(isLoading: boolean, delay = DEFAULT_DELAY) {
  const [isSlow, setIsSlow] = useState(false);
  const [wasLoading, setWasLoading] = useState(isLoading);

  if (wasLoading !== isLoading) {
    setWasLoading(isLoading);
    setIsSlow(false);
  }

  useEffect(() => {
    if (!isLoading) return;

    const timer = setTimeout(() => setIsSlow(true), delay);
    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return isLoading && isSlow;
}
