"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, SendHorizonal, X } from "lucide-react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { UserAvatar } from "@/components/chat/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/chat";
import {
  FALLBACK,
  GREETING,
  OPENING_CHIPS,
  findTopic,
  topicById,
  type BotLink,
  type BotTopic,
} from "./support-bot-data";

/* ---------------------------------------------------------------------------
   The help widget is the product.

   It renders through the same `MessageBubble` the chat panel uses, so the thing
   answering questions about the app is visibly the app. The answers come from a
   lookup table rather than a model: it can decline, but it cannot make anything
   up.
--------------------------------------------------------------------------- */

const BOT = { id: "chat app-guide", name: "Chat app guide" };
const YOU = "you";
const THINKING_MS = 550;

const makeMessage = (senderId: string, text: string, seq: number): Message => ({
  id: `bot-${seq}`,
  conversationId: "support",
  senderId,
  text,
  sentAt: new Date(),
  status: "sent",
});

function Chips({
  ids,
  onPick,
}: {
  ids: string[];
  onPick: (topic: BotTopic) => void;
}) {
  const topics = ids
    .map(topicById)
    .filter((topic): topic is BotTopic => Boolean(topic));

  if (topics.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {topics.map((topic) => (
        <button
          key={topic.id}
          type="button"
          onClick={() => onPick(topic)}
          className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {topic.chip}
        </button>
      ))}
    </div>
  );
}

function AnswerLinks({ links }: { links: BotLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {/* Real anchors, not buttons wearing an anchor: a link has to announce
          itself as a link. */}
      {links.map((link) =>
        link.external ? (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "xs", variant: "secondary" })}
          >
            {link.label}
          </a>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            className={buttonVariants({ size: "xs" })}
          >
            {link.label}
          </Link>
        ),
      )}
    </div>
  );
}

export function SupportBot() {
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chips, setChips] = useState<string[]>(OPENING_CHIPS);
  const [links, setLinks] = useState<BotLink[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const seq = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, thinking, open]);

  useEffect(() => {
    if (!open) return;

    input.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const say = (senderId: string, text: string) => {
    seq.current += 1;
    setMessages((current) => [
      ...current,
      makeMessage(senderId, text, seq.current),
    ]);
  };

  const answer = (question: string, topic: BotTopic | null) => {
    say(YOU, question);
    setLinks([]);
    setChips([]);
    setThinking(true);

    timers.current.push(
      setTimeout(
        () => {
          setThinking(false);
          say(BOT.id, topic ? topic.answer : FALLBACK);
          setLinks(topic?.links ?? []);
          setChips(topic?.next ?? OPENING_CHIPS);
        },
        reduced ? 0 : THINKING_MS,
      ),
    );
  };

  const openPanel = () => {
    setOpen(true);
    if (messages.length === 0) say(BOT.id, GREETING);
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return; // Same rule as the app: empty messages do not send.
    setDraft("");
    answer(text, findTopic(text));
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            return;
          }
          openPanel();
        }}
        aria-expanded={open}
        aria-controls="support-bot-panel"
        aria-label={open ? "Close the guide" : "Ask the guide a question"}
        className="fixed right-4 bottom-4 z-50 flex size-13 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform outline-none hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 sm:right-6 sm:bottom-6"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <MessageCircle className="size-5" aria-hidden="true" />
        )}
      </button>

      {open && (
        <div
          id="support-bot-panel"
          role="dialog"
          aria-label="Chat app guide"
          className={cn(
            "fixed right-4 bottom-20 z-50 flex w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-xl sm:right-6 sm:bottom-24",
            "h-[min(30rem,calc(100dvh-8rem))]",
            "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
          )}
        >
          <header className="flex items-center gap-2.5 border-b border-border px-3 py-2.5">
            <UserAvatar
              name={BOT.name}
              seed={BOT.id}
              size="sm"
              presence="online"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{BOT.name}</p>
              <p className="truncate font-mono text-[0.625rem] tracking-[0.14em] text-muted-foreground uppercase">
                Scripted · answers instantly
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Close the guide"
              onClick={() => {
                setOpen(false);
                trigger.current?.focus();
              }}
            >
              <X />
            </Button>
          </header>

          <div
            ref={scroller}
            role="log"
            aria-live="polite"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-background px-3 py-3"
          >
            <div className="flex min-h-full flex-col justify-end">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === YOU}
                  isFirstOfGroup
                  isLastOfGroup
                />
              ))}

              {thinking && (
                <p className="px-1 py-1.5 text-xs text-muted-foreground">
                  Looking that up…
                </p>
              )}
            </div>
          </div>

          <AnswerLinks links={links} />
          <Chips ids={chips} onPick={(topic) => answer(topic.chip, topic)} />

          <form
            onSubmit={submit}
            className="flex items-center gap-2 border-t border-border bg-card px-3 py-2.5"
          >
            <label htmlFor="support-bot-input" className="sr-only">
              Ask the guide a question
            </label>
            <input
              id="support-bot-input"
              ref={input}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask about the app…"
              maxLength={140}
              autoComplete="off"
              className="min-w-0 flex-1 rounded-lg bg-muted px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <Button
              type="submit"
              size="icon-sm"
              disabled={draft.trim().length === 0}
              aria-label="Send question"
            >
              <SendHorizonal />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
