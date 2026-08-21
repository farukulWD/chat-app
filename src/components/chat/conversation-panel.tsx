"use client";

import { useState } from "react";
import { MessageSquareOff, MessagesSquare } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationHeader } from "./conversation-header";
import { GroupInfoDrawer } from "./group-info-drawer";
import { MessageComposer } from "./message-composer";
import { MessageList } from "./message-list";
import { StateBlock } from "./state-block";
import {
  useConversation,
  useCurrentUser,
  useMessages,
} from "@/hooks/use-chat-data";

function HeaderSkeleton() {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-3 py-3">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ConversationPanel({
  conversationId,
}: {
  conversationId: string;
}) {
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const conversation = useConversation(conversationId);
  const messages = useMessages(conversationId);
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (conversation.isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <HeaderSkeleton />
        <div className="min-h-0 flex-1" />
      </div>
    );
  }

  if (!conversation.data) {
    return (
      <StateBlock
        icon={MessageSquareOff}
        title="Conversation not found"
        description="It may have been removed, or you're no longer a participant."
        className="h-full"
      />
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ConversationHeader
        conversation={conversation.data}
        onOpenDetails={() => setDetailsOpen(true)}
      />

      <MessageList
        conversation={conversation.data}
        messages={messages.data}
        isLoading={messages.isLoading}
        isError={messages.isError}
        onRetry={messages.refetch}
        hasMore={messages.hasMore}
        isLoadingOlder={messages.isLoadingOlder}
        onLoadOlder={messages.loadOlder}
        meId={meId}
        typingUser={messages.peerTyping}
      />

      <MessageComposer
        onSend={messages.sendMessage}
        conversationTitle={conversation.data.title}
      />

      <GroupInfoDrawer
        conversation={conversation.data}
        me={me}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
    </div>
  );
}

export function NoConversationSelected() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <MessagesSquare className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold">Your messages</p>
        <p className="max-w-72 text-sm text-muted-foreground">
          Pick a conversation from the list, or start a new one to begin.
        </p>
      </div>
    </div>
  );
}
