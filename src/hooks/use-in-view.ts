"use client";

import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(options?: {
  disabled?: boolean;
  rootMargin?: string;
}): { ref: React.RefObject<T | null>; inView: boolean } {
  const { disabled = false, rootMargin = "0px 0px -12% 0px" } = options ?? {};

  const ref = useRef<T>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (disabled) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setEntered(true);
        observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [disabled, rootMargin]);

  return { ref, inView: disabled || entered };
}
