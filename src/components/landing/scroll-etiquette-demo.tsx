"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { useInView } from "@/hooks/use-in-view";
import { useMounted } from "@/hooks/use-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import type { Message } from "@/types/chat";

const CONVERSATION_ID = "68f3a2";
const PEER = "demo-nusrat";
const ME = "demo-you";
const INTERVAL_MS = 2600;
const BOTTOM_SLACK = 24;
const KEEP = 24;

const SEED: { from: string; text: string }[] = [
  { from: PEER, text: "Sending the release notes over now." },
  { from: ME, text: "Go ahead, I'm reading." },
  { from: PEER, text: "Section one: the login screen takes a number only." },
  { from: PEER, text: "New numbers register themselves, no second form." },
  { from: ME, text: "So there's no second screen to fill in at all?" },
  { from: PEER, text: "None. The number is the account." },
  { from: PEER, text: "Section two is the conversation list." },
  { from: ME, text: "Sorted by last message, I assume." },
  { from: PEER, text: "Yes, and it re-sorts itself as messages land." },
  { from: PEER, text: "I'll keep going — stop me whenever." },
];

const INCOMING = [
  "Section two: search runs on name and number together.",
  "Groups take the same search, just more selections.",
  "Receipts tick from sending to sent when the server confirms.",
  "Presence dims the moment the socket drops.",
  "Failed sends keep their text and offer a retry.",
  "Empty messages never leave the composer.",
  "Every state has a real screen: loading, empty, error.",
  "That's the lot — scroll back down whenever you like.",
];

const seedMessages = (): Message[] => {
  const now = Date.now();
  return SEED.map((seed, index) => ({
    id: `seed-${index}`,
    conversationId: CONVERSATION_ID,
    senderId: seed.from,
    text: seed.text,
    sentAt: new Date(now - (SEED.length - index) * 60_000),
    status: "sent" as const,
  }));
};

export function ScrollEtiquetteDemo() {
  const reduced = useReducedMotion();
  const { ref: rootRef, inView } = useInView<HTMLDivElement>({
    rootMargin: "0px",
  });

  const scroller = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const nextIncoming = useRef(0);
  const seq = useRef(0);

  const mounted = useMounted();
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [pending, setPending] = useState(0);
  const [held, setHeld] = useState(false);

  // Open on the newest message, the way the conversation panel does.
  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, []);

  const jumpToLatest = useCallback(
    (smooth: boolean) => {
      const node = scroller.current;
      if (!node) return;
      node.scrollTo({
        top: node.scrollHeight,
        behavior: smooth && !reduced ? "smooth" : "auto",
      });
      atBottom.current = true;
      setPending(0);
      setHeld(false);
    },
    [reduced],
  );

  const onScroll = () => {
    const node = scroller.current;
    if (!node) return;

    const distance = node.scrollHeight - node.scrollTop - node.clientHeight;
    atBottom.current = distance <= BOTTOM_SLACK;

    if (atBottom.current) {
      setPending(0);
      setHeld(false);
    } else {
      setHeld(true);
    }
  };

  useEffect(() => {
    if (!inView) return;

    const timer = setInterval(() => {
      seq.current += 1;
      const text = INCOMING[nextIncoming.current % INCOMING.length];
      nextIncoming.current += 1;

      setMessages((current) => {
        const next = [
          ...current,
          {
            id: `in-${seq.current}`,
            conversationId: CONVERSATION_ID,
            senderId: PEER,
            text,
            sentAt: new Date(),
            status: "sent" as const,
          },
        ];

        return atBottom.current && next.length > KEEP
          ? next.slice(next.length - KEEP)
          : next;
      });

      if (atBottom.current) {
        requestAnimationFrame(() => jumpToLatest(false));
      } else {
        setPending((count) => count + 1);
      }
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, [inView, jumpToLatest]);

  return (
    <div ref={rootRef} className="relative flex h-full min-h-72 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 rounded-t-2xl border border-b-0 border-border bg-card px-4 py-2.5">
        <p className="font-mono text-[0.6875rem] tracking-[0.16em] text-muted-foreground uppercase">
          Nusrat Jahan · live
        </p>
        <p className="text-xs text-muted-foreground">
          {held ? "Holding your position" : "Following the latest"}
        </p>
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        tabIndex={0}
        role="log"
        aria-label="Demo conversation that keeps receiving messages"
        className="max-h-72 min-h-0 flex-1 overflow-y-auto lg:max-h-none overscroll-contain rounded-b-2xl border border-border bg-background px-3 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <div className="flex min-h-full flex-col justify-end">
          {(mounted ? messages : []).map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === ME}
              isFirstOfGroup
              isLastOfGroup
            />
          ))}
        </div>
      </div>

      {pending > 0 && (
        <button
          type="button"
          onClick={() => jumpToLatest(true)}
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
          {pending} new {pending === 1 ? "message" : "messages"}
        </button>
      )}
    </div>
  );
}
