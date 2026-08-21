"use client";

import { useState } from "react";
import {
  Check,
  LogOut,
  MoreVertical,
  Pencil,
  ShieldAlert,
  ShieldCheck,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "./user-avatar";
import { getPresence } from "@/lib/mock-chat";
import type { User } from "@/types/auth";
import type { Conversation } from "@/types/chat";

export function GroupInfoDrawer({
  conversation,
  me,
  open,
  onOpenChange,
}: {
  conversation: Conversation;
  me: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isGroup = conversation.type === "group";
  const adminIds = conversation.adminIds ?? [];
  const meId = me?._id ?? "";
  const iAmAdmin = adminIds.includes(meId);
  const hasNoAdmin = isGroup && adminIds.length === 0;

  // A draft only exists while renaming, so the displayed name is always the
  // conversation's own — nothing to keep in sync when it changes elsewhere.
  const [draftName, setDraftName] = useState<string | null>(null);
  const isRenaming = draftName !== null;

  function handleOpenChange(next: boolean) {
    if (!next) setDraftName(null);
    onOpenChange(next);
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right">
      <DrawerContent aria-label={isGroup ? "Group info" : "Contact info"}>
        <DrawerHeader className="flex flex-row items-start justify-between gap-2 pb-3 text-left">
          <div className="min-w-0">
            <DrawerTitle>{isGroup ? "Group info" : "Contact info"}</DrawerTitle>
            <DrawerDescription>
              {isGroup
                ? `${conversation.participants.length} members`
                : conversation.peer?.phone}
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

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex flex-col items-center gap-3 px-4 pb-5">
            <UserAvatar
              name={conversation.title}
              seed={conversation.id}
              isGroup={isGroup}
              className="size-20 **:data-[slot=avatar-fallback]:text-xl"
            />

            {isRenaming ? (
              <form
                className="flex w-full items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();

                  setDraftName(null);
                }}
              >
                <Input
                  autoFocus
                  value={draftName}
                  maxLength={60}
                  className="h-9"
                  aria-label="Group name"
                  onChange={(event) => setDraftName(event.target.value)}
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Save name"
                  disabled={!draftName.trim()}
                >
                  <Check />
                </Button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="text-center text-base font-semibold">
                  {conversation.title}
                </p>
                {isGroup && iAmAdmin && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Rename group"
                    onClick={() => setDraftName(conversation.title)}
                  >
                    <Pencil />
                  </Button>
                )}
              </div>
            )}

            {!isGroup && conversation.peer && (
              <p className="font-mono text-sm tabular-nums text-muted-foreground">
                {conversation.peer.phone}
              </p>
            )}
          </div>

          {hasNoAdmin && (
            <div className="mx-4 mb-4 flex gap-2.5 rounded-lg bg-warning/10 p-3 text-xs leading-relaxed text-warning">
              <ShieldAlert
                className="mt-px size-4 shrink-0"
                aria-hidden="true"
              />
              <p>
                This group has no admin. Members can&apos;t be added or
                promoted, and the group can&apos;t be renamed.
              </p>
            </div>
          )}

          {isGroup && (
            <>
              <Separator />

              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Members
                </h3>
                {iAmAdmin && (
                  <Button variant="ghost" size="sm">
                    <UserPlus />
                    Add
                  </Button>
                )}
              </div>

              <ul className="px-2 pb-2">
                {conversation.participants.map((person) => {
                  const isMe = person._id === meId;
                  const isAdmin = adminIds.includes(person._id);

                  return (
                    <li
                      key={person._id}
                      className="flex items-center gap-3 rounded-lg px-2 py-2"
                    >
                      <UserAvatar
                        name={isMe ? "You" : person.name}
                        seed={person._id}
                        presence={isMe ? "online" : getPresence(person._id)}
                        className="shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {isMe ? "You" : person.name}
                        </p>
                        <p className="truncate font-mono text-xs tabular-nums text-muted-foreground">
                          {isMe ? me?.phone : person.phone}
                        </p>
                      </div>

                      {isAdmin && (
                        <Badge variant="secondary" className="shrink-0 gap-1">
                          <ShieldCheck className="size-3" />
                          Admin
                        </Badge>
                      )}

                      {iAmAdmin && !isMe && (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Manage ${person.name}`}
                              />
                            }
                          >
                            <MoreVertical />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled={isAdmin}>
                              <ShieldCheck />
                              {isAdmin ? "Already an admin" : "Make admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserMinus />
                              Remove from group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  );
                })}
              </ul>

              <Separator />

              <div className="p-3">
                <Button
                  variant="destructive"
                  className="h-9 w-full justify-start"
                >
                  <LogOut />
                  Leave group
                </Button>
              </div>
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
