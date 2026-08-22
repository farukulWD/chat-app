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

type ChatState = {
  outbox: Record<string, PendingMessage[]>;
  unread: Record<string, number>;
  activeConversationId: string | null;
};

const initialState: ChatState = {
  outbox: {},
  unread: {},
  activeConversationId: null,
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

    /** Opening a conversation is the only read signal available. */
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
} = chatSlice.actions;

export default chatSlice.reducer;
