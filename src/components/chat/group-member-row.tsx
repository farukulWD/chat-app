"use client";

import { Crown, MoreVertical, ShieldCheck, UserMinus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "./user-avatar";
import { useLastActiveLabel, useSelfPresence } from "@/hooks/use-presence";
import type { User } from "@/types/auth";

export function GroupMemberRow({
  person,
  isMe,
  isAdmin,
  isCreator,
  myPhone,
  canManage,
  isBusy,
  onPromote,
  onRequestRemove,
}: {
  person: User;
  isMe: boolean;
  isAdmin: boolean;
  /** Permanent: creators can neither leave nor be removed. */
  isCreator: boolean;
  myPhone?: string;
  /** Viewer is an admin, so the actions menu is theirs. */
  canManage: boolean;
  isBusy: boolean;
  onPromote: (person: User) => void;
  onRequestRemove: (person: User) => void;
}) {
  const name = isMe ? "You" : person.name;

  // Only our own live state is knowable; others get a last-seen, or nothing.
  const selfPresence = useSelfPresence();
  const lastActive = useLastActiveLabel(isMe ? undefined : person._id);

  // An admin creator can be neither promoted nor removed — no menu at all.
  const canPromote = !isAdmin;
  const canRemove = !isCreator;
  const hasMenu = canManage && !isMe && (canPromote || canRemove);

  return (
    <li
      aria-busy={isBusy || undefined}
      className="flex items-center gap-3 rounded-lg px-2 py-2"
    >
      <UserAvatar
        name={name}
        seed={person._id}
        presence={isMe ? selfPresence : undefined}
        className="shrink-0"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="truncate text-xs text-muted-foreground">
          <span className="font-mono tabular-nums">
            {isMe ? myPhone : person.phone}
          </span>
          {lastActive && ` · ${lastActive}`}
        </p>
      </div>

      {isBusy && <Spinner className="shrink-0 text-muted-foreground" />}

      {isCreator ? (
        <Badge variant="secondary" className="shrink-0 gap-1">
          <Crown className="size-3" />
          Creator
        </Badge>
      ) : (
        isAdmin && (
          <Badge variant="secondary" className="shrink-0 gap-1">
            <ShieldCheck className="size-3" />
            Admin
          </Badge>
        )
      )}

      {hasMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                disabled={isBusy}
                aria-label={`Manage ${person.name}`}
              />
            }
          >
            <MoreVertical />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canPromote && (
              <DropdownMenuItem onClick={() => onPromote(person)}>
                <ShieldCheck />
                Make admin
              </DropdownMenuItem>
            )}
            {canRemove && (
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onRequestRemove(person)}
              >
                <UserMinus />
                Remove from group
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}
