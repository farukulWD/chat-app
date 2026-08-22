"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  applyMessageToInbox,
  useGetConversationsQuery,
} from "@/redux/api/conversations-api";
import {
  upsertCachedMessage,
  useGetMessagesQuery,
  useSendMessageMutation,
} from "@/redux/api/messages-api";
import { SEARCH_RESULT_CAP, useSearchUsersQuery } from "@/redux/api/users-api";
import {
  activitySeen,
  messageFailed,
  messageQueued,
  messageRetrying,
  messageSettled,
  type PendingMessage,
} from "@/redux/features/chat/chat-slice";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { byRecencyDesc, toConversation } from "@/lib/adapters/conversation";
import { fromRestMessage } from "@/lib/adapters/message";
import type { User } from "@/types/auth";
import type { ChatQuery, Conversation, Message } from "@/types/chat";

const SEARCH_DELAY = 350;

type Activity = { userId: string; at: number };

const toActivity = (
  senderId: string | undefined,
  createdAt: string | undefined,
): Activity[] => {
  if (!senderId || !createdAt) return [];
  const at = Date.parse(createdAt);
  return Number.isNaN(at) ? [] : [{ userId: senderId, at }];
};

export const useCurrentUser = (): User | null => {
  return useAppSelector((state) => state.auth.user);
};

export const useConversations = (): ChatQuery<Conversation[]> => {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const unread = useAppSelector((state) => state.chat.unread);
  const isAuthenticated = status === "authenticated";

  const query = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnReconnect: true,
  });

  useEffect(() => {
    if (!query.data) return;

    const seen = query.data.flatMap((row) =>
      toActivity(row.lastMessage?.sender, row.lastMessage?.createdAt),
    );

    if (seen.length) dispatch(activitySeen(seen));
  }, [query.data, dispatch]);

  const data = useMemo(
    () =>
      query.data
        ?.map(toConversation)
        .map((conversation) => ({
          ...conversation,
          unreadCount: unread[conversation.id] ?? 0,
        }))
        .sort(byRecencyDesc),
    [query.data, unread],
  );

  return {
    data,
    isLoading: query.isLoading || !isAuthenticated,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useConversation = (
  conversationId: string,
): ChatQuery<Conversation> => {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useConversations();

  const found = useMemo(
    () => data?.find((conversation) => conversation.id === conversationId),
    [data, conversationId],
  );

  const isPending = isLoading || Boolean(isFetching);

  return {
    data: found,
    isLoading: isLoading || (!found && Boolean(isFetching)),
    isFetching,
    isError: isError || (!isPending && !found),
    error,
    refetch,
  };
};

export type MessagesQuery = ChatQuery<Message[]> & {
  hasMore: boolean;
  isLoadingOlder: boolean;
  loadOlder: () => void;
  sendMessage: (text: string) => void;
  retryMessage: (tempId: string) => void;
};

const toPendingMessage = (pending: PendingMessage): Message => ({
  id: pending.tempId,
  conversationId: pending.conversationId,
  senderId: pending.senderId,
  text: pending.text,
  sentAt: new Date(pending.sentAt),
  status: pending.status,
});

type Cursor = { conversationId: string; before?: string };

const newTempId = () =>
  `temp-${
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }`;

export const useMessages = (conversationId: string): MessagesQuery => {
  const dispatch = useAppDispatch();
  const meId = useCurrentUser()?._id ?? "";

  const outbox = useAppSelector((state) => state.chat.outbox[conversationId]);

  const [cursor, setCursor] = useState<Cursor>({ conversationId });

  if (cursor.conversationId !== conversationId) {
    setCursor({ conversationId });
  }

  const query = useGetMessagesQuery(
    { conversationId, before: cursor.before },
    { skip: !conversationId },
  );

  const [sendMessageMutation] = useSendMessageMutation();

  const data = useMemo(() => {
    if (!query.data) return undefined;

    return [
      ...query.data.messages.map(fromRestMessage),
      ...(outbox ?? []).map(toPendingMessage),
    ];
  }, [query.data, outbox]);

  const loaded = query.data?.messages;

  useEffect(() => {
    if (!loaded?.length) return;

    const seen = loaded.flatMap((message) =>
      toActivity(message.sender, message.createdAt),
    );

    if (seen.length) dispatch(activitySeen(seen));
  }, [loaded, dispatch]);

  const oldestId = query.data?.messages[0]?._id;

  const loadOlder = useCallback(() => {
    if (!oldestId || query.isFetching) return;
    setCursor({ conversationId, before: oldestId });
  }, [oldestId, conversationId, query.isFetching]);

  const deliver = useCallback(
    async (pending: PendingMessage) => {
      const { tempId } = pending;

      try {
        const created = await sendMessageMutation({
          conversationId: pending.conversationId,
          text: pending.text,
        }).unwrap();

        if (!created?._id) {
          dispatch(
            messageFailed({ conversationId: pending.conversationId, tempId }),
          );
          return;
        }

        dispatch(
          messageSettled({ conversationId: pending.conversationId, tempId }),
        );
        dispatch(upsertCachedMessage(created));
        dispatch(
          applyMessageToInbox({
            conversationId: created.conversation,
            senderId: created.sender,
            text: created.text,
            sentAt: created.createdAt,
          }),
        );
      } catch {
        dispatch(
          messageFailed({ conversationId: pending.conversationId, tempId }),
        );
      }
    },
    [dispatch, sendMessageMutation],
  );

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      if (!trimmed || !conversationId) return;

      const pending: PendingMessage = {
        tempId: newTempId(),
        conversationId,
        senderId: meId,
        text: trimmed,
        sentAt: new Date().toISOString(),
        status: "pending",
      };

      dispatch(messageQueued(pending));
      void deliver(pending);
    },
    [conversationId, meId, dispatch, deliver],
  );

  const retryMessage = useCallback(
    (tempId: string) => {
      const pending = outbox?.find((message) => message.tempId === tempId);
      if (!pending || pending.status === "pending") return;

      dispatch(messageRetrying({ conversationId, tempId }));
      void deliver(pending);
    },
    [outbox, conversationId, dispatch, deliver],
  );

  return {
    data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    hasMore: Boolean(query.data?.hasMore),
    isLoadingOlder: query.isFetching && Boolean(cursor.before),
    loadOlder,
    sendMessage,
    retryMessage,
    refetch: query.refetch,
  };
};

const REGEX_METACHARACTER = /[+*?(){}[\]\\^$|]/;

export type UserSearchQuery = ChatQuery<User[]> & {
  isTruncated: boolean;
};

export const useUserSearch = (term: string): UserSearchQuery => {
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const query = useDebouncedValue(term.trim(), SEARCH_DELAY);
  const isUnsearchable = REGEX_METACHARACTER.test(query);

  const search = useSearchUsersQuery(query, {
    skip: !query || isUnsearchable,
  });

  const data = useMemo(
    () =>
      search.data
        ?.filter((person) => person._id !== meId)
        .map((person) => ({
          _id: person._id,
          name: person.name,
          phone: person.phone,
        })),
    [search.data, meId],
  );

  return {
    data: isUnsearchable ? undefined : data,
    isTruncated: (search.data?.length ?? 0) >= SEARCH_RESULT_CAP,

    isLoading:
      Boolean(term.trim()) &&
      !isUnsearchable &&
      (query !== term.trim() || search.isLoading || search.isFetching),
    isError: isUnsearchable || search.isError,
    error: search.error,
    refetch: search.refetch,
  };
};
