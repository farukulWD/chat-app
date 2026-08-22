"use client";

import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "./user-avatar";
import { useLastActiveLabel } from "@/hooks/use-presence";
import type { Conversation } from "@/types/chat";

export function ConversationHeader({
  conversation,
  onOpenDetails,
}: {
  conversation: Conversation;
  onOpenDetails: () => void;
}) {
  const isGroup = conversation.type === "group";
  const lastActive = useLastActiveLabel(conversation.peer?._id);

  // No peer presence exists, so fall back to the phone number.
  const subtitle = isGroup
    ? `${conversation.participants.length} members`
    : (lastActive ?? conversation.peer?.phone);

  return (
    <header className="flex items-center gap-2 border-b border-border bg-card px-2 py-2 sm:px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Back to conversations"
        className="md:hidden"
        nativeButton={false}
        render={<Link href="/chat" />}
      >
        <ChevronLeft />
      </Button>

      <button
        type="button"
        onClick={onOpenDetails}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-1.5 py-1 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <UserAvatar
          name={conversation.title}
          seed={conversation.id}
          isGroup={isGroup}
          className="shrink-0"
        />
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold">
            {conversation.title}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        </span>
      </button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onOpenDetails}
        aria-label={isGroup ? "Group info" : "Contact info"}
      >
        <Info />
      </Button>
    </header>
  );
}
