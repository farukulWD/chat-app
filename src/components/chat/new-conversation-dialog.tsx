"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SearchInput } from "./search-input";
import { UserSearchResults } from "./user-search-results";
import { useUserSearch } from "@/hooks/use-chat-data";
import { mockConversationIdForPeer } from "@/lib/mock-chat";
import type { User } from "@/types/auth";

export const NewConversationDialog = ({
  open,
  onOpenChange,
  onSwitchToGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToGroup: () => void;
}) => {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const { data, isLoading, isError } = useUserSearch(term);

  const handleOpenChange = (next: boolean) => {
    if (!next) setTerm("");
    onOpenChange(next);
  };

  const start = (person: User) => {
    const conversationId = mockConversationIdForPeer(person._id);
    handleOpenChange(false);
    if (conversationId) router.push(`/chat/${conversationId}`);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-4 pb-3 text-left">
          <DialogTitle>New chat</DialogTitle>
          <DialogDescription>
            Find someone by name, or type their full phone number.
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-3">
          <SearchInput
            autoFocus
            value={term}
            onValueChange={setTerm}
            aria-label="Search people"
            placeholder="Name or phone number"
          />
        </div>

        <Separator />

        <div className="max-h-[min(24rem,50dvh)] overflow-y-auto overscroll-contain">
          <UserSearchResults
            term={term}
            users={data}
            isLoading={isLoading}
            isError={isError}
            onSelect={start}
          />
        </div>

        <Separator />

        <div className="px-2 py-2">
          <Button
            variant="ghost"
            className="h-10 w-full justify-start"
            onClick={() => {
              setTerm("");
              onSwitchToGroup();
            }}
          >
            <Users />
            New group conversation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
