"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { SearchInput } from "./search-input";
import { UserAvatar } from "./user-avatar";
import { UserSearchResults } from "./user-search-results";
import { useUserSearch } from "@/hooks/use-chat-data";
import { useCreateGroupConversationMutation } from "@/redux/api/conversations-api";
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/api-error";
import type { User } from "@/types/auth";

/** The API rejects a group under three members — you plus two others. */
const MIN_OTHERS = 2;
const NAME_MAX = 60;

export function NewGroupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<User[]>([]);
  const [failure, setFailure] = useState<string | null>(null);

  const { data, isLoading, isError, isTruncated } = useUserSearch(term);
  const [createGroupConversation, { isLoading: isCreating }] =
    useCreateGroupConversationMutation();

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("");
      setTerm("");
      setSelected([]);
      setFailure(null);
    }
    onOpenChange(next);
  }

  function toggle(person: User) {
    setSelected((current) =>
      current.some((entry) => entry._id === person._id)
        ? current.filter((entry) => entry._id !== person._id)
        : [...current, person],
    );
  }

  const shortBy = MIN_OTHERS - selected.length;
  const canCreate = name.trim().length > 0 && shortBy <= 0;

  async function create() {
    if (!canCreate || isCreating) return;
    setFailure(null);

    try {
      // The caller is added by the server and becomes the sole admin, so only
      // the other members go in `participantIds`.
      const created = await createGroupConversation({
        name: name.trim(),
        participantIds: selected.map((person) => person._id),
      }).unwrap();

      handleOpenChange(false);
      router.push(`/chat/${created._id}`);
    } catch (error) {
      // A validation failure names the offending field in `details[]` —
      // `participantIds` reads "a group needs at least 3 members".
      const fields = getApiFieldErrors(error);
      setFailure(
        fields.participantIds ?? fields.name ?? getApiErrorMessage(error),
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-4 pb-3 text-left">
          <DialogTitle>New group</DialogTitle>
          <DialogDescription>
            Name the group and add at least two other people.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-4 pb-3">
          <Field>
            <FieldLabel htmlFor="group-name">Group name</FieldLabel>
            <Input
              id="group-name"
              value={name}
              maxLength={NAME_MAX}
              className="h-10"
              placeholder="Design Team"
              onChange={(event) => setName(event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="group-participants">Members</FieldLabel>
            <SearchInput
              value={term}
              onValueChange={setTerm}
              aria-label="Search people to add"
              placeholder="Search by name"
            />
          </Field>

          {selected.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {selected.map((person) => (
                <li key={person._id}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1 pr-1 pl-1.5 text-xs font-medium text-secondary-foreground">
                    <UserAvatar
                      size="sm"
                      name={person.name}
                      seed={person._id}
                      className="size-5"
                    />
                    {person.name}
                    <button
                      type="button"
                      aria-label={`Remove ${person.name}`}
                      onClick={() => toggle(person)}
                      className="flex size-4 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="max-h-[min(18rem,38dvh)] overflow-y-auto overscroll-contain">
          <UserSearchResults
            multiple
            term={term}
            users={data}
            isLoading={isLoading}
            isError={isError}
            isTruncated={isTruncated}
            selectedIds={selected.map((person) => person._id)}
            onSelect={toggle}
          />
        </div>

        <Separator />

        {failure && (
          <p
            role="alert"
            className="flex items-start gap-2 px-4 pt-2.5 text-xs leading-snug text-destructive"
          >
            <TriangleAlert className="mt-px size-3.5 shrink-0" />
            {failure}
          </p>
        )}

        <div className="flex items-center gap-3 px-4 py-3">
          <p className="min-w-0 flex-1 text-xs leading-snug text-muted-foreground">
            {shortBy > 0
              ? `Add ${shortBy} more ${shortBy === 1 ? "person" : "people"} — a group needs three members.`
              : `You and ${selected.length} others.`}
          </p>
          <Button
            onClick={create}
            disabled={!canCreate || isCreating}
            className="h-10 shrink-0 px-4"
          >
            {isCreating && <Spinner />}
            Create group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
