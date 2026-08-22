"use client";

import { useEffect, useRef } from "react";
import { baseApi } from "@/redux/api/base-api";
import {
  applyConversationUpdate,
  applyMessageToInbox,
} from "@/redux/api/conversations-api";
import { upsertCachedMessage } from "@/redux/api/messages-api";
import {
  activitySeen,
  connectionChanged,
  unreadIncremented,
} from "@/redux/features/chat/chat-slice";
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
      dispatch(connectionChanged("disconnected"));
      return;
    }

    const token = getToken();
    if (!token) return;

    const socket = getSocket(token);
    if (!socket) return;

    dispatch(connectionChanged(socket.connected ? "connected" : "connecting"));

    const onConnect = () => {
      dispatch(connectionChanged("connected"));

      if (hasConnected.current) {
        dispatch(baseApi.util.invalidateTags(["Conversation", "Message"]));
      }
      hasConnected.current = true;
    };

    const onDisconnect = () => {
      dispatch(connectionChanged("disconnected"));
    };

    const onMessage = (payload: ApiSocketMessage) => {
      if (!payload?.id || !payload.conversation) return;

      const sentAt = new Date(payload.createdAt).toISOString();

      // Sending is the only proof of life this API emits.
      dispatch(
        activitySeen([
          { userId: payload.sender, at: Number(payload.createdAt) },
        ]),
      );

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
      // `meId` lets the patch spot a payload I'm no longer a participant of.
      dispatch(applyConversationUpdate(payload, meId));
    };

    const onConnectError = (error: Error) => {
      dispatch(connectionChanged("disconnected"));

      if (AUTH_FAILURES.includes(error.message)) {
        closeSocket();
        forceLogout();
        return;
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onMessage);
    socket.on("conversation:updated", onConversationUpdated);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onMessage);
      socket.off("conversation:updated", onConversationUpdated);
      socket.off("connect_error", onConnectError);
    };
  }, [status, meId, dispatch]);

  useEffect(() => () => closeSocket(), []);

  return children;
}
