"use client";

import { useEffect, useRef } from "react";
import { baseApi } from "@/redux/api/base-api";
import {
  applyConversationUpdate,
  applyMessageToInbox,
} from "@/redux/api/conversations-api";
import { upsertCachedMessage } from "@/redux/api/messages-api";
import { unreadIncremented } from "@/redux/features/chat/chat-slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getToken } from "@/lib/auth-token";
import { forceLogout } from "@/lib/force-logout";
import { closeSocket, getSocket } from "@/lib/socket";
import type { ApiGroupConversation, ApiSocketMessage } from "@/types/api";

const AUTH_FAILURES = ["Invalid token", "No token provided"];

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const meId = useAppSelector((state) => state.auth.user?._id);

  const hasConnected = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      closeSocket();
      return;
    }

    const token = getToken();
    if (!token) return;

    const socket = getSocket(token);
    if (!socket) return;

    const onConnect = () => {
      if (hasConnected.current) {
        dispatch(baseApi.util.invalidateTags(["Conversation", "Message"]));
      }
      hasConnected.current = true;
    };

    const onMessage = (payload: ApiSocketMessage) => {
      if (!payload?.id || !payload.conversation) return;

      const sentAt = new Date(payload.createdAt).toISOString();

      dispatch(
        upsertCachedMessage({
          _id: payload.id,
          conversation: payload.conversation,
          sender: payload.sender,
          text: payload.text,
          createdAt: sentAt,
        }),
      );

      let isUnknownConversation = false;

      dispatch(
        applyMessageToInbox(
          {
            conversationId: payload.conversation,
            senderId: payload.sender,
            text: payload.text,
            sentAt,
          },
          () => {
            isUnknownConversation = true;
          },
        ),
      );

      if (isUnknownConversation) {
        dispatch(baseApi.util.invalidateTags(["Conversation"]));
      }

      if (payload.sender !== meId) {
        dispatch(unreadIncremented(payload.conversation));
      }
    };

    const onConversationUpdated = (payload: ApiGroupConversation) => {
      if (!payload?._id) return;
      dispatch(applyConversationUpdate(payload));
    };

    const onConnectError = (error: Error) => {
      if (AUTH_FAILURES.includes(error.message)) {
        closeSocket();
        forceLogout();
        return;
      }
    };

    socket.on("connect", onConnect);
    socket.on("message:new", onMessage);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("message:new", onMessage);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("connect_error", onConnectError);
    };
  }, [status, meId, dispatch]);

  useEffect(() => () => closeSocket(), []);

  return children;
}
