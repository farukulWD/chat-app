import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { clearCredentials } from "@/redux/features/auth/auth-slice";

export type PendingMessage = {
  tempId: string;
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
  status: "pending" | "failed";
};

export type ConnectionStatus = "connecting" | "connected" | "disconnected";

type ChatState = {
  outbox: Record<string, PendingMessage[]>;
  unread: Record<string, number>;
  activeConversationId: string | null;
  connection: ConnectionStatus;
  lastActiveAt: Record<string, number>;
};

const initialState: ChatState = {
  outbox: {},
  unread: {},
  activeConversationId: null,
  connection: "connecting",
  lastActiveAt: {},
};

const withoutTemp = (queue: PendingMessage[] | undefined, tempId: string) =>
  (queue ?? []).filter((message) => message.tempId !== tempId);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    messageQueued(state, action: PayloadAction<PendingMessage>) {
      const { conversationId } = action.payload;
      state.outbox[conversationId] = [
        ...withoutTemp(state.outbox[conversationId], action.payload.tempId),
        action.payload,
      ];
    },

    messageFailed(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>,
    ) {
      const queue = state.outbox[action.payload.conversationId];
      const pending = queue?.find(
        (message) => message.tempId === action.payload.tempId,
      );
      if (pending) pending.status = "failed";
    },

    messageRetrying(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>,
    ) {
      const queue = state.outbox[action.payload.conversationId];
      const pending = queue?.find(
        (message) => message.tempId === action.payload.tempId,
      );
      if (pending) pending.status = "pending";
    },

    messageSettled(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>,
    ) {
      const { conversationId, tempId } = action.payload;
      const remaining = withoutTemp(state.outbox[conversationId], tempId);

      if (remaining.length) state.outbox[conversationId] = remaining;
      else delete state.outbox[conversationId];
    },

    unreadIncremented(state, action: PayloadAction<string>) {
      const conversationId = action.payload;
      if (conversationId === state.activeConversationId) return;
      state.unread[conversationId] = (state.unread[conversationId] ?? 0) + 1;
    },

    connectionChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.connection = action.payload;
    },

    activitySeen(
      state,
      action: PayloadAction<{ userId: string; at: number }[]>,
    ) {
      for (const { userId, at } of action.payload) {
        if (!userId || !Number.isFinite(at)) continue;
        if ((state.lastActiveAt[userId] ?? 0) < at) {
          state.lastActiveAt[userId] = at;
        }
      }
    },

    conversationOpened(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      if (action.payload) delete state.unread[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(clearCredentials, () => initialState);
  },
});

export const {
  messageQueued,
  messageFailed,
  messageRetrying,
  messageSettled,
  unreadIncremented,
  conversationOpened,
  connectionChanged,
  activitySeen,
} = chatSlice.actions;

export default chatSlice.reducer;
