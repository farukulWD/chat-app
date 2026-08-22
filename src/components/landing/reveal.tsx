"use client";

import { useInView } from "@/hooks/use-in-view";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ disabled: reduced });

  return (
    <div
      ref={ref}
      className={cn(
        "reveal motion-safe:transition-[opacity,translate] motion-safe:duration-700 motion-safe:ease-out",
        inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
        className,
      )}
      style={inView && !reduced ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
