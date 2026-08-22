"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Crown,
  LogOut,
  Pencil,
  ShieldAlert,
  TriangleAlert,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { AddMembersDrawer } from "./add-members-drawer";
import { ConfirmDrawer } from "./confirm-drawer";
import { GroupMemberRow } from "./group-member-row";
import { UserAvatar } from "./user-avatar";
import { useGroupActions } from "@/hooks/use-group-actions";
import type { User } from "@/types/auth";
import type { Conversation } from "@/types/chat";

const NAME_MAX = 60;

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
  const iAmCreator = Boolean(meId) && meId === conversation.createdById;

  const memberIds = useMemo(
    () => conversation.participants.map((person) => person._id),
    [conversation.participants],
  );

  const hasNoAdmin = isGroup && !adminIds.some((id) => memberIds.includes(id));

  const actions = useGroupActions(conversation, me);

  const [draftName, setDraftName] = useState<string | null>(null);
  const isRenaming = draftName !== null;

  const [addOpen, setAddOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<User | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setDraftName(null);
      actions.clearError();
    }
    onOpenChange(next);
  }

  async function submitRename(event: React.FormEvent) {
    event.preventDefault();

    const name = draftName?.trim();
    if (!name || actions.pending) return;

    if (await actions.rename(name)) setDraftName(null);
  }

  async function removeMember() {
    if (!confirmRemove) return;

    if (await actions.removeMember(confirmRemove._id)) setConfirmRemove(null);
  }

  async function leaveGroup() {
    if (await actions.leave()) setConfirmLeave(false);
  }

  const isRenamePending = actions.pending === "rename";

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
                onSubmit={submitRename}
              >
                <Input
                  autoFocus
                  value={draftName}
                  maxLength={NAME_MAX}
                  disabled={isRenamePending}
                  className="h-9"
                  aria-label="Group name"
                  onChange={(event) => setDraftName(event.target.value)}
                />
                <Button
                  type="submit"
                  size="icon-sm"
                  aria-label="Save name"
                  disabled={!draftName.trim() || isRenamePending}
                >
                  {isRenamePending ? <Spinner /> : <Check />}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cancel rename"
                  disabled={isRenamePending}
                  onClick={() => {
                    setDraftName(null);
                    actions.clearError();
                  }}
                >
                  <X />
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
                    onClick={() => {
                      actions.clearError();
                      setDraftName(conversation.title);
                    }}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      actions.clearError();
                      setAddOpen(true);
                    }}
                  >
                    <UserPlus />
                    Add
                  </Button>
                )}
              </div>

              <ul className="px-2 pb-2">
                {conversation.participants.map((person) => (
                  <GroupMemberRow
                    key={person._id}
                    person={person}
                    isMe={person._id === meId}
                    isAdmin={adminIds.includes(person._id)}
                    isCreator={person._id === conversation.createdById}
                    myPhone={me?.phone}
                    canManage={iAmAdmin}
                    isBusy={actions.pendingUserId === person._id}
                    onPromote={(target) => void actions.promote(target._id)}
                    onRequestRemove={(target) => {
                      actions.clearError();
                      setConfirmRemove(target);
                    }}
                  />
                ))}
              </ul>

              <Separator />

              {actions.error && (
                <p
                  role="alert"
                  className="flex items-start gap-2 px-4 pt-3 text-xs leading-snug text-destructive"
                >
                  <TriangleAlert className="mt-px size-3.5 shrink-0" />
                  {actions.error}
                </p>
              )}

              <div className="p-3">
                {iAmCreator ? (
                  <p className="flex items-start gap-2 px-1 py-1.5 text-xs leading-relaxed text-muted-foreground">
                    <Crown className="mt-px size-3.5 shrink-0" />
                    You created this group, so you can&apos;t leave it.
                  </p>
                ) : (
                  <Button
                    variant="destructive"
                    className="h-9 w-full justify-start"
                    disabled={Boolean(actions.pending)}
                    onClick={() => {
                      actions.clearError();
                      setConfirmLeave(true);
                    }}
                  >
                    <LogOut />
                    Leave group
                  </Button>
                )}
              </div>

              <AddMembersDrawer
                open={addOpen}
                onOpenChange={setAddOpen}
                memberIds={memberIds}
                isPending={actions.pending === "add"}
                error={actions.error}
                onAdd={actions.addMembers}
              />

              <ConfirmDrawer
                open={confirmRemove !== null}
                onOpenChange={(next) => !next && setConfirmRemove(null)}
                title={`Remove ${confirmRemove?.name ?? "this member"}?`}
                description={`They'll lose access to “${conversation.title}” and won't see new messages. An admin can add them back later.`}
                confirmLabel="Remove"
                isPending={actions.pending === "remove"}
                error={actions.error}
                onConfirm={() => void removeMember()}
              />

              <ConfirmDrawer
                open={confirmLeave}
                onOpenChange={setConfirmLeave}
                title={`Leave “${conversation.title}”?`}
                description="You'll stop receiving new messages, and only an admin can add you back."
                confirmLabel="Leave group"
                isPending={actions.pending === "leave"}
                error={actions.error}
                onConfirm={() => void leaveGroup()}
              />
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
