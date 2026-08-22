"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import { useGetConversationsQuery } from "@/redux/api/conversations-api";
import { SEARCH_RESULT_CAP, useSearchUsersQuery } from "@/redux/api/users-api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { byRecencyDesc, toConversation } from "@/lib/adapters/conversation";
import { createMockMessages } from "@/lib/mock-chat";
import type { User } from "@/types/auth";
import type { ChatQuery, Conversation, Message } from "@/types/chat";

const PAGE_SIZE = 10;

const SIMULATE_INCOMING = true;
const TYPING_AFTER = 9_000;
const INCOMING_AFTER = 12_000;

const LOAD_DELAY = 550;
const SEARCH_DELAY = 350;
const SEND_DELAY = 600;

export const useCurrentUser = (): User | null => {
  return useAppSelector((state) => state.auth.user);
};

export const useConversations = (): ChatQuery<Conversation[]> => {
  const status = useAppSelector((state) => state.auth.status);
  const isAuthenticated = status === "authenticated";

  const query = useGetConversationsQuery(undefined, {
    skip: !isAuthenticated,
    refetchOnReconnect: true,
  });

  const data = useMemo(
    () => query.data?.map(toConversation).sort(byRecencyDesc),
    [query.data],
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

  // A conversation created a moment ago is absent from the cached list until
  // the invalidated refetch lands — and that refetch is `isFetching`, not
  // `isLoading`. Calling it missing before then flashes "not found" on a
  // conversation the user just deliberately started.
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
  peerTyping: User | null;
};

type Thread = { key: string; messages: Message[]; visible: number };

export const useMessages = (conversationId: string): MessagesQuery => {
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const [nonce, setNonce] = useState(0);
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [typing, setTyping] = useState<{ key: string; user: User } | null>(
    null,
  );
  const olderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = `${conversationId}|${meId}|${nonce}`;
  const isLoading = thread?.key !== key;

  useEffect(() => {
    const timer = setTimeout(
      () =>
        setThread({
          key,
          messages: createMockMessages(meId, conversationId),
          visible: PAGE_SIZE,
        }),
      LOAD_DELAY,
    );
    return () => clearTimeout(timer);
  }, [key, meId, conversationId]);

  // Stands in for a `message:new` socket event.
  useEffect(() => {
    if (!SIMULATE_INCOMING || isLoading) return;

    const lastPeer = [...createMockMessages(meId, conversationId)]
      .reverse()
      .find((message) => message.senderId !== meId);
    if (!lastPeer) return;

    const sender: User = { _id: lastPeer.senderId, name: "", phone: "" };

    const typingTimer = setTimeout(
      () => setTyping({ key, user: sender }),
      TYPING_AFTER,
    );

    const arrivalTimer = setTimeout(() => {
      setTyping(null);
      setThread((current) =>
        current?.key === key
          ? {
              ...current,
              visible: current.visible + 1,
              messages: [
                ...current.messages,
                {
                  id: `${conversationId}-incoming-${Date.now()}`,
                  conversationId,
                  senderId: lastPeer.senderId,
                  text: "Just saw this — looks good to me. 👍",
                  sentAt: new Date(),
                  status: "sent",
                },
              ],
            }
          : current,
      );
    }, INCOMING_AFTER);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(arrivalTimer);
    };
  }, [key, isLoading, meId, conversationId]);

  useEffect(
    () => () => {
      if (olderTimer.current) clearTimeout(olderTimer.current);
    },
    [],
  );

  const data = useMemo(() => {
    if (isLoading || !thread) return undefined;
    return thread.messages.slice(
      Math.max(0, thread.messages.length - thread.visible),
    );
  }, [thread, isLoading]);

  const hasMore =
    !isLoading && Boolean(thread) && thread!.messages.length > thread!.visible;

  const loadOlder = useCallback(() => {
    setIsLoadingOlder(true);
    olderTimer.current = setTimeout(() => {
      setThread((current) =>
        current
          ? { ...current, visible: current.visible + PAGE_SIZE }
          : current,
      );
      setIsLoadingOlder(false);
    }, LOAD_DELAY);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      // The API accepts "   " and stores it. This rule is ours to enforce.
      if (!trimmed) return;

      const id = `${conversationId}-own-${Date.now()}`;

      setThread((current) =>
        current
          ? {
              ...current,
              visible: current.visible + 1,
              messages: [
                ...current.messages,
                {
                  id,
                  conversationId,
                  senderId: meId,
                  text: trimmed,
                  sentAt: new Date(),
                  status: "pending",
                },
              ],
            }
          : current,
      );

      setTimeout(() => {
        setThread((current) =>
          current
            ? {
                ...current,
                messages: current.messages.map((message) =>
                  message.id === id ? { ...message, status: "sent" } : message,
                ),
              }
            : current,
        );
      }, SEND_DELAY);
    },
    [conversationId, meId],
  );

  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return {
    data,
    isLoading,
    isError: false,
    hasMore,
    isLoadingOlder,
    loadOlder,
    sendMessage,
    peerTyping: typing?.key === key ? typing.user : null,
    refetch,
  };
};

/**
 * The search term is interpolated into a regular expression unescaped on the
 * server. Anything that cannot legally open a pattern comes back as a `500` —
 * `+` included, which puts every E.164 number out of reach. Caught here so the
 * request is never made.
 */
const REGEX_METACHARACTER = /[+*?(){}[\]\\^$|]/;

export type UserSearchQuery = ChatQuery<User[]> & {
  /** The server hit its result cap, so the person being looked for may exist
   *  and still be absent. The only remedy is a longer term. */
  isTruncated: boolean;
};

export const useUserSearch = (term: string): UserSearchQuery => {
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const query = useDebouncedValue(term.trim(), SEARCH_DELAY);
  const isUnsearchable = REGEX_METACHARACTER.test(query);

  const search = useSearchUsersQuery(query, {
    // An empty `q` is not rejected — it returns an arbitrary 50 accounts.
    skip: !query || isUnsearchable,
  });

  const data = useMemo(
    () =>
      search.data
        // The caller comes back in their own results, and passing your own id
        // to `POST /conversations` returns an unrelated conversation.
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
    // The debounce means the term is settled a beat after the last keystroke;
    // treat that gap as loading so the results never look stale-but-final.
    isLoading:
      Boolean(term.trim()) &&
      !isUnsearchable &&
      (query !== term.trim() || search.isLoading || search.isFetching),
    isError: isUnsearchable || search.isError,
    error: search.error,
    refetch: search.refetch,
  };
};
