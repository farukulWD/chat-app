"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import { useMounted } from "@/hooks/use-mounted";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import {
  DEMO_CONVERSATION_ID,
  ME,
  PEER,
  PEER_NUDGE,
  PEER_REPLIES,
  SEED,
} from "./live-demo-data";

const ACK_MS = 350;
const TYPING_START_MS = 900;
const TYPING_MS = 1200;
const NUDGE_MS = 4200;
const WIRE_LIMIT = 4;

type WireLine = { id: number; at: Date; event: string; detail: string };

const logClock = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function TypingDots({ still }: { still: boolean }) {
  if (still) {
    return <span className="text-xs text-muted-foreground">typing…</span>;
  }

  return (
    <span className="flex items-center gap-1" aria-hidden="true">
      {[0, 160, 320].map((delay) => (
        <span
          key={delay}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/70"
          style={{ animationDelay: `${delay}ms`, animationDuration: "1s" }}
        />
      ))}
    </span>
  );
}

function Panel({
  viewerId,
  name,
  phone,
  peerName,
  messages,
  typing,
  stillTyping,
  footer,
  className,
}: {
  viewerId: string;
  name: string;
  phone: string;
  peerName: string;
  messages: Message[];
  typing: boolean;
  stillTyping: boolean;
  footer: React.ReactNode;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, typing]);

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <header className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
        <UserAvatar
          name={peerName}
          seed={viewerId === ME.id ? PEER.id : ME.id}
          size="sm"
          presence="online"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{peerName}</p>
          <p className="truncate font-mono text-[0.6875rem] text-muted-foreground">
            {phone}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
          {name}
        </span>
      </header>

      <div
        ref={scroller}
        className="h-64 min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-3 py-3 sm:h-72"
      >
        <div className="flex min-h-full flex-col justify-end">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={
                index >= SEED.length
                  ? "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1"
                  : undefined
              }
            >
              <MessageBubble
                message={message}
                isOwn={message.senderId === viewerId}
                isFirstOfGroup
                isLastOfGroup
              />
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-2 px-1 py-1.5">
              <TypingDots still={stillTyping} />
              <span className="sr-only">{peerName} is typing</span>
            </div>
          )}
        </div>
      </div>

      {footer}
    </div>
  );
}

const seedMessages = (): Message[] => {
  const now = Date.now();
  return SEED.map((seed, index) => ({
    id: `seed-${index}`,
    conversationId: DEMO_CONVERSATION_ID,
    senderId: seed.from,
    text: seed.text,
    sentAt: new Date(now - seed.minutesAgo * 60_000),
    status: "sent" as const,
  }));
};

export function LiveDemo() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>({ rootMargin: "0px" });

  const mounted = useMounted();
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [wire, setWire] = useState<WireLine[]>(() => [
    {
      id: 0,
      at: new Date(),
      event: "connect",
      detail: `conversation ${DEMO_CONVERSATION_ID} · 2 participants`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [peerTyping, setPeerTyping] = useState(false);
  const [side, setSide] = useState<"me" | "peer">("me");

  const seq = useRef(0);
  const replyIndex = useRef(0);
  const hasSent = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((ms: number, run: () => void) => {
    timers.current.push(setTimeout(run, ms));
  }, []);

  const log = useCallback((event: string, detail: string) => {
    seq.current += 1;
    const line = { id: seq.current, at: new Date(), event, detail };
    setWire((lines) => [...lines, line].slice(-WIRE_LIMIT));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
    };
  }, []);

  const peerSays = useCallback(
    (text: string) => {
      setPeerTyping(true);
      later(reduced ? 0 : TYPING_MS, () => {
        setPeerTyping(false);
        seq.current += 1;
        setMessages((current) => [
          ...current,
          {
            id: `peer-${seq.current}`,
            conversationId: DEMO_CONVERSATION_ID,
            senderId: PEER.id,
            text,
            sentAt: new Date(),
            status: "sent",
          },
        ]);
        log("message:new", `sender ${PEER.name.split(" ")[0].toLowerCase()}`);
      });
    },
    [later, log, reduced],
  );

  useEffect(() => {
    if (!mounted || !inView || hasSent.current) return;
    const timer = setTimeout(() => {
      if (hasSent.current) return;
      peerSays(PEER_NUDGE);
    }, NUDGE_MS);
    return () => clearTimeout(timer);
  }, [mounted, inView, peerSays]);

  const send = (event: React.FormEvent) => {
    event.preventDefault();

    const text = draft.trim();
    if (!text) return; // Empty messages are not sendable — same rule as the app.

    hasSent.current = true;
    setDraft("");
    seq.current += 1;
    const id = `mine-${seq.current}`;

    setMessages((current) => [
      ...current,
      {
        id,
        conversationId: DEMO_CONVERSATION_ID,
        senderId: ME.id,
        text,
        sentAt: new Date(),
        status: "pending",
      },
    ]);
    log("message:send", `${text.length} chars · awaiting ack`);

    later(reduced ? 0 : ACK_MS, () => {
      setMessages((current) =>
        current.map((message) =>
          message.id === id ? { ...message, status: "sent" } : message,
        ),
      );
      log("message:new", `conversation ${DEMO_CONVERSATION_ID} · delivered`);
    });

    later(reduced ? 0 : TYPING_START_MS, () => {
      const reply = PEER_REPLIES[replyIndex.current % PEER_REPLIES.length];
      replyIndex.current += 1;
      peerSays(reply);
    });
  };

  const composer = (
    <form
      onSubmit={send}
      className="flex items-center gap-2 border-t border-border bg-card px-3 py-2.5"
    >
      <label htmlFor="demo-composer" className="sr-only">
        Message {PEER.name}
      </label>
      <input
        id="demo-composer"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Write a message…"
        maxLength={140}
        autoComplete="off"
        className="min-w-0 flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <Button
        type="submit"
        size="icon-sm"
        disabled={draft.trim().length === 0}
        aria-label="Send message"
      >
        <SendHorizonal />
      </Button>
    </form>
  );

  const peerFooter = (
    <div className="flex h-13.25 items-center gap-2 border-t border-border bg-card px-3 text-xs text-muted-foreground">
      <span className="size-1.5 rounded-full bg-status-online" />
      {PEER.name.split(" ")[0]}&apos;s screen — updating live
    </div>
  );

  return (
    <div ref={ref} className="w-full">
      <div
        className="mb-3 flex gap-1 rounded-xl border border-border bg-card p-1 md:hidden"
        role="group"
        aria-label="Choose which screen to watch"
      >
        {(
          [
            ["me", "Your screen"],
            ["peer", `${PEER.name.split(" ")[0]}'s screen`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setSide(value)}
            aria-pressed={side === value}
            className={cn(
              "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              side === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <Panel
          viewerId={ME.id}
          name="You"
          phone={PEER.phone}
          peerName={PEER.name}
          messages={mounted ? messages : []}
          typing={peerTyping}
          stillTyping={reduced}
          footer={composer}
          className={cn(side === "me" ? "flex" : "hidden", "md:flex")}
        />

        <Panel
          viewerId={PEER.id}
          name={PEER.name.split(" ")[0]}
          phone={ME.phone}
          peerName={ME.name}
          messages={mounted ? messages : []}
          typing={false}
          stillTyping={reduced}
          footer={peerFooter}
          className={cn(side === "peer" ? "flex" : "hidden", "md:flex")}
        />
      </div>

      <div
        aria-live="polite"
        aria-label="Connection activity"
        className="mt-3 min-h-18 overflow-hidden rounded-xl border border-border bg-muted/40 px-3 py-2.5 font-mono text-[0.6875rem] leading-relaxed text-muted-foreground"
      >
        {mounted ? (
          wire.map((line) => (
            <p key={line.id} className="flex gap-2 truncate">
              <span className="tabular-nums opacity-70">
                {logClock(line.at)}
              </span>
              <span className="text-foreground">{line.event}</span>
              <span className="truncate">{line.detail}</span>
            </p>
          ))
        ) : (
          <p className="opacity-70">opening socket…</p>
        )}
      </div>
    </div>
  );
}
