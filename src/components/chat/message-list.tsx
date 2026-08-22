"use client";

import { useEffect, useMemo, useRef } from "react";
import { ArrowDown, MessageSquare, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DayDivider } from "./day-divider";
import { MessageBubble } from "./message-bubble";
import { MessageListSkeleton } from "./message-list-skeleton";
import { StateBlock } from "./state-block";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useSlowLoading } from "@/hooks/use-slow-loading";
import { isSameDay } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";
import type { Conversation, Message } from "@/types/chat";

const RUN_GAP = 5 * 60_000;

type Row =
  | { kind: "day"; key: string; date: Date }
  | {
      kind: "message";
      key: string;
      message: Message;
      isFirstOfGroup: boolean;
      isLastOfGroup: boolean;
    };

const buildRows = (messages: Message[]): Row[] => {
  const rows: Row[] = [];

  messages.forEach((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];

    const startsDay = !previous || !isSameDay(previous.sentAt, message.sentAt);
    if (startsDay) {
      rows.push({
        kind: "day",
        key: `day-${message.sentAt.toDateString()}`,
        date: message.sentAt,
      });
    }

    const brokeFromPrevious =
      startsDay ||
      previous.senderId !== message.senderId ||
      message.sentAt.getTime() - previous.sentAt.getTime() > RUN_GAP;

    const breaksToNext =
      !next ||
      next.senderId !== message.senderId ||
      !isSameDay(next.sentAt, message.sentAt) ||
      next.sentAt.getTime() - message.sentAt.getTime() > RUN_GAP;

    rows.push({
      kind: "message",
      key: message.id,
      message,
      isFirstOfGroup: brokeFromPrevious,
      isLastOfGroup: breaksToNext,
    });
  });

  return rows;
};

export function MessageList({
  conversation,
  messages,
  isLoading,
  isError,
  onRetry,
  hasMore,
  isLoadingOlder,
  onLoadOlder,
  onRetryMessage,
  meId,
}: {
  conversation: Conversation;
  messages: Message[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  hasMore: boolean;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onRetryMessage: (messageId: string) => void;
  meId: string;
}) {
  const {
    viewportRef,
    onScroll,
    isPinned,
    unseenCount,
    scrollToBottom,
    captureAnchor,
  } = useAutoScroll({
    items: messages,
    resetKey: conversation.id,
    currentUserId: meId,
  });

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Render's free tier suspends idle instances, so the very first load of the
  // session can legitimately take most of a minute. Say so rather than leaving
  // a skeleton that looks stuck.
  const isSlow = useSlowLoading(isLoading);

  const participantsById = useMemo(() => {
    const map = new Map<string, User>();
    conversation.participants.forEach((person) => map.set(person._id, person));
    if (conversation.peer) map.set(conversation.peer._id, conversation.peer);
    return map;
  }, [conversation]);

  useEffect(() => {
    const node = sentinelRef.current;
    const root = viewportRef.current;
    if (!node || !root || !hasMore || isLoadingOlder) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        captureAnchor();
        onLoadOlder();
      },
      { root, rootMargin: "120px 0px 0px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoadingOlder, onLoadOlder, captureAnchor, viewportRef]);

  const rows = useMemo(() => buildRows(messages ?? []), [messages]);
  const isGroup = conversation.type === "group";

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={viewportRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-3 sm:px-4">
          {isLoading && (
            <>
              <MessageListSkeleton />
              {isSlow && (
                <p className="pb-4 text-center text-xs text-muted-foreground">
                  The server is waking up — this first load can take a minute.
                </p>
              )}
            </>
          )}

          {!isLoading && isError && (
            <StateBlock
              tone="destructive"
              icon={TriangleAlert}
              title="Couldn't load this conversation"
              description="The messages didn't come through. Check your connection and try again."
              action={{ label: "Try again", onClick: onRetry }}
              className="m-auto"
            />
          )}

          {!isLoading && !isError && rows.length === 0 && (
            <StateBlock
              icon={MessageSquare}
              title="No messages yet"
              description={
                isGroup
                  ? "Say something to get the group started."
                  : `Send the first message to ${conversation.title}.`
              }
              className="m-auto"
            />
          )}

          {!isLoading && !isError && rows.length > 0 && (
            <>
              <div ref={sentinelRef} className="h-px" />

              {isLoadingOlder && (
                <div className="flex justify-center py-3">
                  <Spinner className="size-4 text-muted-foreground" />
                  <span className="sr-only">Loading older messages</span>
                </div>
              )}

              {!hasMore && !isLoadingOlder && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  This is the beginning of your conversation.
                </p>
              )}

              <ol className="pb-2">
                {rows.map((row) => {
                  if (row.kind === "day") {
                    return (
                      <li key={row.key}>
                        <DayDivider date={row.date} />
                      </li>
                    );
                  }

                  const isOwn = row.message.senderId === meId;
                  const sender = participantsById.get(row.message.senderId);

                  return (
                    <li key={row.key}>
                      <MessageBubble
                        message={row.message}
                        isOwn={isOwn}
                        senderName={
                          isGroup && !isOwn
                            ? (sender?.name ?? "Unknown")
                            : undefined
                        }
                        isFirstOfGroup={row.isFirstOfGroup}
                        isLastOfGroup={row.isLastOfGroup}
                        onRetry={
                          row.message.status === "failed"
                            ? () => onRetryMessage(row.message.id)
                            : undefined
                        }
                      />
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-all duration-200",
          isPinned
            ? "translate-y-2 opacity-0"
            : "pointer-events-auto translate-y-0 opacity-100",
        )}
      >
        <Button
          size="sm"
          variant="secondary"
          onClick={() => scrollToBottom()}
          tabIndex={isPinned ? -1 : 0}
          aria-hidden={isPinned}
          className="rounded-full border border-border shadow-md"
        >
          <ArrowDown />
          {unseenCount > 0
            ? `${unseenCount} new message${unseenCount === 1 ? "" : "s"}`
            : "Jump to latest"}
        </Button>
      </div>
    </div>
  );
}
