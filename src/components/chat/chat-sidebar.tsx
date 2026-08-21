"use client";

import { useState } from "react";
import { MessageSquarePlus, SquarePen, Users } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AccountMenu } from "./account-menu";
import { ConversationList } from "./conversation-list";
import { NewConversationDialog } from "./new-conversation-dialog";
import { NewGroupDialog } from "./new-group-dialog";
import { SearchInput } from "./search-input";
import { useConversations, useCurrentUser } from "@/hooks/use-chat-data";

export function ChatSidebar({ activeId }: { activeId: string | null }) {
  const me = useCurrentUser();
  const { data, isLoading, isError, refetch } = useConversations();

  const [filter, setFilter] = useState("");
  const [newChatOpen, setNewChatOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  return (
    <>
      <div className="flex h-full min-h-0 flex-col bg-sidebar">
        <header className="flex items-center gap-1 px-4 pt-4 pb-3">
          <Logo className="mr-auto text-[0.8125rem]" markClassName="size-7" />
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="New conversation"
                />
              }
            >
              <SquarePen />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => setNewChatOpen(true)}>
                <MessageSquarePlus />
                New chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setNewGroupOpen(true)}>
                <Users />
                New group
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="px-4 pb-3">
          <SearchInput
            value={filter}
            onValueChange={setFilter}
            aria-label="Filter conversations"
            placeholder="Search chats"
            className="bg-card"
          />
        </div>

        <nav
          aria-label="Conversations"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        >
          <ConversationList
            conversations={data}
            isLoading={isLoading}
            isError={isError}
            onRetry={refetch}
            meId={me?._id ?? ""}
            activeId={activeId}
            filter={filter}
            onStartConversation={() => setNewChatOpen(true)}
          />
        </nav>

        <footer className="border-t border-sidebar-border p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <AccountMenu user={me} />
        </footer>
      </div>

      <NewConversationDialog
        open={newChatOpen}
        onOpenChange={setNewChatOpen}
        onSwitchToGroup={() => {
          setNewChatOpen(false);
          setNewGroupOpen(true);
        }}
      />
      <NewGroupDialog open={newGroupOpen} onOpenChange={setNewGroupOpen} />
    </>
  );
}
