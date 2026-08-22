"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, Users } from "lucide-react";
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
import { useCreateDirectConversationMutation } from "@/redux/api/conversations-api";
import { getApiErrorMessage } from "@/lib/api-error";
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
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const { data, isLoading, isError, isTruncated } = useUserSearch(term);
  const [createDirectConversation] = useCreateDirectConversationMutation();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setTerm("");
      setPendingId(null);
      setFailure(null);
    }
    onOpenChange(next);
  };

  const start = async (person: User) => {
    setPendingId(person._id);
    setFailure(null);

    try {
      const created = await createDirectConversation({
        userId: person._id,
      }).unwrap();

      handleOpenChange(false);
      router.push(`/chat/${created._id}`);
    } catch (error) {
      setPendingId(null);
      setFailure(getApiErrorMessage(error));
    }
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
            isTruncated={isTruncated}
            pendingId={pendingId ?? undefined}
            onSelect={start}
          />
        </div>

        <Separator />

        {failure && (
          <p
            role="alert"
            className="flex items-start gap-2 px-4 py-2.5 text-xs leading-snug text-destructive"
          >
            <TriangleAlert className="mt-px size-3.5 shrink-0" />
            {failure}
          </p>
        )}

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
