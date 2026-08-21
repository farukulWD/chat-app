"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppSelector } from "@/redux/hooks";
import {
  createMockConversations,
  createMockMessages,
  searchMockUsers,
} from "@/lib/mock-chat";
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
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const [nonce, setNonce] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    data: Conversation[];
  } | null>(null);

  const key = `${meId}|${nonce}`;

  useEffect(() => {
    const timer = setTimeout(
      () => setLoaded({ key, data: createMockConversations(meId) }),
      LOAD_DELAY,
    );
    return () => clearTimeout(timer);
  }, [key, meId]);

  const isLoading = loaded?.key !== key;
  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return {
    data: isLoading ? undefined : loaded?.data,
    isLoading,
    isError: false,
    refetch,
  };
};

export const useConversation = (
  conversationId: string,
): ChatQuery<Conversation> => {
  const { data, isLoading, isError, refetch } = useConversations();

  const found = useMemo(
    () => data?.find((conversation) => conversation.id === conversationId),
    [data, conversationId],
  );

  return {
    data: found,
    isLoading,
    isError: isError || (!isLoading && !found),
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

const REGEX_METACHARACTER = /[+*?(){}[\]\\^$|]/;

export const useUserSearch = (term: string): ChatQuery<User[]> => {
  const me = useCurrentUser();
  const meId = me?._id ?? "";

  const [nonce, setNonce] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    data?: User[];
    isError: boolean;
  } | null>(null);

  const query = term.trim();
  const key = `${query}|${meId}|${nonce}`;

  useEffect(() => {
    if (!query) return;

    const timer = setTimeout(() => {
      setResult(
        REGEX_METACHARACTER.test(query)
          ? { key, isError: true }
          : { key, data: searchMockUsers(query, meId), isError: false },
      );
    }, SEARCH_DELAY);

    return () => clearTimeout(timer);
  }, [key, query, meId]);

  const settled = Boolean(query) && result?.key === key;
  const refetch = useCallback(() => setNonce((value) => value + 1), []);

  return {
    data: settled ? result?.data : undefined,
    isLoading: Boolean(query) && !settled,
    isError: settled ? Boolean(result?.isError) : false,
    refetch,
  };
};
