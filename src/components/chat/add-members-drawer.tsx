"use client";

import { useMemo, useState } from "react";
import { TriangleAlert, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { SearchInput } from "./search-input";
import { UserAvatar } from "./user-avatar";
import { UserSearchResults } from "./user-search-results";
import { useUserSearch } from "@/hooks/use-chat-data";
import type { User } from "@/types/auth";

export function AddMembersDrawer({
  open,
  onOpenChange,
  memberIds,
  isPending,
  error,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Already in the group. Re-adding is a no-op, but offering it looks broken. */
  memberIds: string[];
  isPending: boolean;
  error: string | null;
  onAdd: (userIds: string[]) => Promise<boolean>;
}) {
  const [term, setTerm] = useState("");
  const [selected, setSelected] = useState<User[]>([]);

  const { data, isLoading, isError, isTruncated } = useUserSearch(term);

  const candidates = useMemo(
    () => data?.filter((person) => !memberIds.includes(person._id)),
    [data, memberIds],
  );

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTerm("");
      setSelected([]);
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

  async function add() {
    if (!selected.length || isPending) return;

    const added = await onAdd(selected.map((person) => person._id));
    if (added) handleOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
      <DrawerContent aria-label="Add members">
        <DrawerHeader className="flex flex-row items-start justify-between gap-2 pb-3 text-left">
          <div className="min-w-0">
            <DrawerTitle>Add members</DrawerTitle>
            <DrawerDescription>
              People already in the group are hidden.
            </DrawerDescription>
          </div>
          <DrawerClose
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Close" />
            }
          >
            <X />
          </DrawerClose>
        </DrawerHeader>

        <div className="space-y-3 px-4 pb-3">
          <SearchInput
            autoFocus
            value={term}
            onValueChange={setTerm}
            aria-label="Search people to add"
            placeholder="Search by name"
          />

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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <UserSearchResults
            multiple
            term={term}
            users={candidates}
            isLoading={isLoading}
            isError={isError}
            isTruncated={isTruncated}
            selectedIds={selected.map((person) => person._id)}
            onSelect={toggle}
          />
        </div>

        <Separator />

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 px-4 pt-2.5 text-xs leading-snug text-destructive"
          >
            <TriangleAlert className="mt-px size-3.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="p-3">
          <Button
            className="h-10 w-full"
            disabled={!selected.length || isPending}
            onClick={add}
          >
            {isPending && <Spinner />}
            {selected.length
              ? `Add ${selected.length} ${selected.length === 1 ? "person" : "people"}`
              : "Add"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
