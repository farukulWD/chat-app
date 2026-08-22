"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAddParticipantsMutation,
  usePromoteAdminMutation,
  useRemoveParticipantMutation,
  useRenameGroupMutation,
} from "@/redux/api/conversations-api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { User } from "@/types/auth";
import type { Conversation } from "@/types/chat";

const GROUP_ERROR_COPY: Record<string, string> = {
  FORBIDDEN: "Only admins can do that.",
  NOT_A_MEMBER: "That person is no longer in this group.",
  NOT_A_GROUP: "That only works on a group conversation.",
  UNKNOWN_USER: "We couldn't find that account.",
};

export type GroupAction = "add" | "remove" | "promote" | "rename" | "leave";

export type GroupActions = {
  addMembers: (userIds: string[]) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  promote: (userId: string) => Promise<boolean>;
  rename: (name: string) => Promise<boolean>;
  leave: () => Promise<boolean>;
  /** Which action is in flight, so one row or one button can show a spinner. */
  pending: GroupAction | null;
  /** The member the pending action targets, where there is one. */
  pendingUserId: string | null;
  error: string | null;
  clearError: () => void;
};

export function useGroupActions(
  conversation: Conversation,
  me: User | null,
): GroupActions {
  const router = useRouter();
  const conversationId = conversation.id;
  const meId = me?._id ?? "";

  const [addParticipants] = useAddParticipantsMutation();
  const [removeParticipant] = useRemoveParticipantMutation();
  const [promoteAdmin] = usePromoteAdminMutation();
  const [renameGroup] = useRenameGroupMutation();

  const [pending, setPending] = useState<GroupAction | null>(null);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const run = useCallback(
    async (
      action: GroupAction,
      userId: string | null,
      call: () => Promise<unknown>,
    ): Promise<boolean> => {
      if (pending) return false;

      setPending(action);
      setPendingUserId(userId);
      setError(null);

      try {
        await call();
        return true;
      } catch (failure) {
        setError(getApiErrorMessage(failure, GROUP_ERROR_COPY));
        return false;
      } finally {
        setPending(null);
        setPendingUserId(null);
      }
    },
    [pending],
  );

  const addMembers = useCallback(
    (userIds: string[]) =>
      run("add", null, () =>
        addParticipants({ conversationId, userIds }).unwrap(),
      ),
    [run, addParticipants, conversationId],
  );

  const removeMember = useCallback(
    (userId: string) =>
      run("remove", userId, () =>
        removeParticipant({ conversationId, userId }).unwrap(),
      ),
    [run, removeParticipant, conversationId],
  );

  const promote = useCallback(
    (userId: string) =>
      run("promote", userId, () =>
        promoteAdmin({ conversationId, userId }).unwrap(),
      ),
    [run, promoteAdmin, conversationId],
  );

  const rename = useCallback(
    (name: string) =>
      run("rename", null, () => renameGroup({ conversationId, name }).unwrap()),
    [run, renameGroup, conversationId],
  );

  const leave = useCallback(async () => {
    if (!meId || meId === conversation.createdById) return false;

    const left = await run("leave", meId, () =>
      removeParticipant({ conversationId, userId: meId }).unwrap(),
    );

    if (left) router.push("/chat");

    return left;
  }, [
    run,
    removeParticipant,
    conversationId,
    meId,
    conversation.createdById,
    router,
  ]);

  return {
    addMembers,
    removeMember,
    promote,
    rename,
    leave,
    pending,
    pendingUserId,
    error,
    clearError,
  };
}
