"use client";

import { useEffect, useState } from "react";
import { CheckCheck } from "lucide-react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";

const PROMPT = "Who's joining?";
const REVEAL_DELAY_MS = 450;

/**
 * The login screen's one flourish: the form said back as a conversation. The
 * outgoing bubble is a live mirror of the fields, which also makes the API's
 * rename-on-re-login behaviour visible — you see how you'll appear to everyone
 * else before you commit to it.
 *
 * Decorative: the inputs themselves carry these values, so this is hidden from
 * assistive tech rather than announced twice.
 */
export function IdentityPreview({
  name,
  phone,
}: {
  name: string;
  /** Formatted E.164 number, or null while it's still incomplete. */
  phone: string | null;
}) {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const timer = window.setTimeout(() => setRevealed(true), REVEAL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  const showPrompt = revealed || reducedMotion;

  return (
    <div aria-hidden="true" className="flex flex-col gap-2 select-none">
      <div className="w-fit rounded-2xl rounded-bl-sm bg-bubble-peer px-3.5 py-2 text-sm text-bubble-peer-foreground">
        {showPrompt ? (
          PROMPT
        ) : (
          <span className="flex h-5 items-center gap-1">
            {[0, 1, 2].map((dot) => (
              <span
                key={dot}
                className="size-1.5 rounded-full bg-current opacity-40 motion-safe:animate-pulse"
                style={{ animationDelay: `${dot * 140}ms` }}
              />
            ))}
          </span>
        )}
      </div>

      <div className="flex flex-col items-end gap-1">
        <div
          data-filled={name.trim().length > 0}
          className={cn(
            "max-w-[85%] rounded-2xl rounded-br-sm bg-bubble-own px-3.5 py-2",
            "text-sm wrap-break-word text-bubble-own-foreground",
            "origin-bottom-right transition-transform duration-150",
            "motion-safe:data-[filled=false]:scale-95",
          )}
        >
          {name.trim() || (
            <span className="inline-block h-4 w-px translate-y-0.5 bg-current motion-safe:animate-pulse" />
          )}
        </div>

        <p className="flex items-center gap-1.5 pr-1 font-mono text-xs tabular-nums text-muted-foreground">
          {phone ?? "number pending"}
          <CheckCheck
            className={cn(
              "size-3.5 transition-colors",
              phone ? "text-receipt-read" : "text-receipt-pending",
            )}
          />
        </p>
      </div>
    </div>
  );
}
