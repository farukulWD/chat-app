"use client";

import Link from "next/link";
import { UserAvatar } from "./user-avatar";
import { getPresence } from "@/lib/mock-chat";
import { formatListTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/chat";

/** "You: ", or "Nadia: " inside a group. Direct chats need no attribution
 *  for the peer — the row is already their name. */
function previewPrefix(
  conversation: Conversation,
  senderId: string,
  meId: string,
): string {
  if (senderId === meId) return "You: ";
  if (conversation.type !== "group") return "";
  const sender = conversation.participants.find((p) => p._id === senderId);
  return sender ? `${sender.name.split(" ")[0]}: ` : "";
}

export function ConversationRow({
  conversation,
  meId,
  isActive,
}: {
  conversation: Conversation;
  meId: string;
  isActive: boolean;
}) {
  const { lastMessage, unreadCount } = conversation;
  const isGroup = conversation.type === "group";
  const presence = conversation.peer ? getPresence(conversation.peer._id) : undefined;

  return (
    <Link
      href={`/chat/${conversation.id}`}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 outline-none transition-colors",
        "hover:bg-sidebar-accent focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
        isActive && "bg-sidebar-accent",
      )}
    >
      <UserAvatar
        size="lg"
        name={conversation.title}
        seed={conversation.id}
        isGroup={isGroup}
        presence={presence}
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate text-sm text-sidebar-foreground",
              unreadCount > 0 ? "font-semibold" : "font-medium",
            )}
          >
            {conversation.title}
          </span>
          {lastMessage && (
            <time
              dateTime={lastMessage.sentAt.toISOString()}
              className={cn(
                "ml-auto shrink-0 text-[0.6875rem] tabular-nums",
                unreadCount > 0 ? "font-medium text-unread" : "text-muted-foreground",
              )}
            >
              {formatListTime(lastMessage.sentAt)}
            </time>
          )}
        </div>

        <div className="mt-0.5 flex items-center gap-2">
          <p
            className={cn(
              "truncate text-[0.8125rem]",
              unreadCount > 0 ? "text-sidebar-foreground" : "text-muted-foreground",
            )}
          >
            {lastMessage ? (
              <>
                <span className="text-muted-foreground">
                  {previewPrefix(conversation, lastMessage.senderId, meId)}
                </span>
                {lastMessage.text}
              </>
            ) : (
              <span className="italic text-muted-foreground">No messages yet</span>
            )}
          </p>

          {unreadCount > 0 && (
            <span
              className="ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-unread px-1.5 text-[0.6875rem] font-semibold tabular-nums text-unread-foreground"
              aria-label={`${unreadCount} unread messages`}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
