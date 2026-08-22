"use client";

import { MessageSquarePlus, SearchX, TriangleAlert } from "lucide-react";
import { ConversationRow } from "./conversation-row";
import { ConversationListSkeleton } from "./conversation-list-skeleton";
import { StateBlock } from "./state-block";
import { useSlowLoading } from "@/hooks/use-slow-loading";
import type { Conversation } from "@/types/chat";

export function ConversationList({
  conversations,
  isLoading,
  isError,
  onRetry,
  meId,
  activeId,
  filter,
  onStartConversation,
}: {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  meId: string;
  activeId: string | null;
  filter: string;
  onStartConversation: () => void;
}) {
  const isSlow = useSlowLoading(isLoading);

  if (isLoading) return <ConversationListSkeleton slow={isSlow} />;

  if (isError) {
    return (
      <StateBlock
        tone="destructive"
        icon={TriangleAlert}
        title="Couldn't load your chats"
        description="The server didn't answer. It may still be waking up."
        action={{ label: "Try again", onClick: onRetry }}
      />
    );
  }

  const all = conversations ?? [];

  if (all.length === 0) {
    return (
      <StateBlock
        icon={MessageSquarePlus}
        title="No conversations yet"
        description="Search for someone by name and say hello."
        action={{ label: "Start a chat", onClick: onStartConversation }}
      />
    );
  }

  const term = filter.trim().toLowerCase();
  const visible = term
    ? all.filter(
        (conversation) =>
          conversation.title.toLowerCase().includes(term) ||
          conversation.participants.some((person) =>
            person.name.toLowerCase().includes(term),
          ),
      )
    : all;

  if (visible.length === 0) {
    return (
      <StateBlock
        icon={SearchX}
        title="No matches"
        description={`Nothing in your chats matches “${filter.trim()}”.`}
      />
    );
  }

  return (
    <ul className="space-y-0.5 px-2 pb-2">
      {visible.map((conversation) => (
        <li key={conversation.id}>
          <ConversationRow
            conversation={conversation}
            meId={meId}
            isActive={conversation.id === activeId}
          />
        </li>
      ))}
    </ul>
  );
}
