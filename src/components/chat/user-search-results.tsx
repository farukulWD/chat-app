"use client";

import { Check, Search, TriangleAlert, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { StateBlock } from "./state-block";
import { UserAvatar } from "./user-avatar";
import { SEARCH_RESULT_CAP } from "@/redux/api/users-api";
import { cn } from "@/lib/utils";
import type { User } from "@/types/auth";

const ResultSkeleton = () => {
  return (
    <div className="space-y-1 p-1" aria-hidden="true">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-2">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const UserSearchResults = ({
  term,
  users,
  isLoading,
  isError,
  selectedIds,
  isTruncated = false,
  pendingId,
  onSelect,
  multiple = false,
}: {
  term: string;
  users: User[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedIds?: string[];
  /** The server capped the results, so a match may exist and still be absent. */
  isTruncated?: boolean;
  /** The person whose conversation is being opened. Locks the list. */
  pendingId?: string;
  onSelect: (user: User) => void;
  multiple?: boolean;
}) => {
  if (!term.trim()) {
    return (
      <StateBlock
        icon={Search}
        title="Search for someone"
        description="Names match from the beginning and are case-sensitive. A phone number has to be typed in full."
      />
    );
  }

  if (isLoading) return <ResultSkeleton />;

  if (isError) {
    return (
      <StateBlock
        tone="destructive"
        icon={TriangleAlert}
        title="That search couldn't run"
        description="The server rejects symbols like + and *. Try searching by name instead."
      />
    );
  }

  const results = users ?? [];

  if (results.length === 0) {
    return (
      <StateBlock
        icon={UserX}
        title="No one found"
        description={`Nothing matches “${term.trim()}”. Check the capital letters — “nadia” and “Nadia” are different here.`}
      />
    );
  }

  return (
    <>
      <ul className="p-1" role={multiple ? "group" : undefined}>
        {results.map((person) => {
          const selected = selectedIds?.includes(person._id) ?? false;
          const isPending = pendingId === person._id;

          return (
            <li key={person._id}>
              <button
                type="button"
                onClick={() => onSelect(person)}
                disabled={Boolean(pendingId)}
                aria-pressed={multiple ? selected : undefined}
                aria-busy={isPending || undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left outline-none transition-colors",
                  "hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50",
                  "disabled:pointer-events-none",
                  selected && "bg-accent",
                  // The row being opened stays legible; the rest recede.
                  pendingId && !isPending && "opacity-50",
                )}
              >
                <UserAvatar
                  name={person.name}
                  seed={person._id}
                  className="shrink-0"
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {person.name}
                  </span>
                  {/* Names collide on this API, so the number is not optional. */}
                  <span className="block truncate font-mono text-xs tabular-nums text-muted-foreground">
                    {person.phone}
                  </span>
                </span>

                {isPending && <Spinner className="shrink-0" />}

                {multiple && (
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input",
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {isTruncated && (
        <p className="px-3 pb-2 text-xs leading-snug text-muted-foreground">
          Only the first {SEARCH_RESULT_CAP} matches are shown. Type more of the
          name to narrow them down.
        </p>
      )}
    </>
  );
};
