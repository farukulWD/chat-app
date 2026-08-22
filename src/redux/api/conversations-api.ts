import { baseApi } from "./base-api";
import type {
  AddParticipantsRequest,
  ApiConversation,
  ApiConversationListResponse,
  ApiDirectConversationCreated,
  ApiGroupConversation,
  CreateDirectRequest,
  CreateGroupRequest,
  PromoteAdminRequest,
  RemoveParticipantRequest,
  RenameGroupRequest,
} from "@/types/api";

/** Structural, since importing `RootState` would close a cycle. */
type StateWithAuth = { auth?: { user?: { _id?: string } | null } };

const currentUserId = (state: unknown): string | undefined =>
  (state as StateWithAuth)?.auth?.user?._id;

/** Folds a mutation's returned group into the inbox cache. */
async function patchInboxFromResponse(
  _arg: unknown,
  {
    dispatch,
    getState,
    queryFulfilled,
  }: {
    dispatch: (action: unknown) => unknown;
    getState: () => unknown;
    queryFulfilled: Promise<{ data: ApiGroupConversation }>;
  },
) {
  const { data: updated } = await queryFulfilled;
  dispatch(applyConversationUpdate(updated, currentUserId(getState())));
}

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<ApiConversation[], void>({
      query: () => ({ url: "/conversations", method: "GET" }),
      transformResponse: (response: ApiConversationListResponse) =>
        response?.data ?? [],
      providesTags: ["Conversation"],
    }),
    createDirectConversation: build.mutation<
      ApiDirectConversationCreated,
      CreateDirectRequest
    >({
      query: (data) => ({ url: "/conversations", method: "POST", data }),
      invalidatesTags: ["Conversation"],
    }),

    createGroupConversation: build.mutation<
      ApiGroupConversation,
      CreateGroupRequest
    >({
      query: (data) => ({
        url: "/conversations/group",
        method: "POST",
        data,
      }),
      invalidatesTags: ["Conversation"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data: created } = await queryFulfilled;

        dispatch(
          conversationsApi.util.updateQueryData(
            "getConversations",
            undefined,
            (draft) => {
              if (draft.some((entry) => entry._id === created._id)) return;
              draft.unshift(created);
            },
          ),
        );
      },
    }),

    // Each returns the whole group, so patch rather than invalidate.
    addParticipants: build.mutation<ApiGroupConversation, AddParticipantsRequest>(
      {
        query: ({ conversationId, userIds }) => ({
          url: `/conversations/${conversationId}/participants`,
          method: "POST",
          data: { userIds },
        }),
        onQueryStarted: patchInboxFromResponse,
      },
    ),

    /** Removes a member, or leaves the group when `userId` is your own. */
    removeParticipant: build.mutation<
      ApiGroupConversation,
      RemoveParticipantRequest
    >({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/participants/${userId}`,
        method: "DELETE",
      }),
      onQueryStarted: patchInboxFromResponse,
    }),

    promoteAdmin: build.mutation<ApiGroupConversation, PromoteAdminRequest>({
      query: ({ conversationId, userId }) => ({
        url: `/conversations/${conversationId}/admins`,
        method: "POST",
        data: { userId },
      }),
      onQueryStarted: patchInboxFromResponse,
    }),

    /** Group only, despite the bare route — a direct one gives `NOT_A_GROUP`. */
    renameGroup: build.mutation<ApiGroupConversation, RenameGroupRequest>({
      query: ({ conversationId, name }) => ({
        url: `/conversations/${conversationId}`,
        method: "PATCH",
        data: { name },
      }),
      onQueryStarted: patchInboxFromResponse,
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
  useAddParticipantsMutation,
  useRemoveParticipantMutation,
  usePromoteAdminMutation,
  useRenameGroupMutation,
} = conversationsApi;

type InboxMessage = {
  conversationId: string;
  senderId: string;
  text: string;
  sentAt: string;
};

export const applyMessageToInbox = (
  message: InboxMessage,
  onUnknownConversation?: () => void,
) =>
  conversationsApi.util.updateQueryData(
    "getConversations",
    undefined,
    (draft) => {
      const entry = draft.find((row) => row._id === message.conversationId);

      if (!entry) {
        onUnknownConversation?.();
        return;
      }

      entry.lastMessage = {
        text: message.text,
        sender: message.senderId,
        createdAt: message.sentAt,
      };
      entry.updatedAt = message.sentAt;
    },
  );

/** `meId` spots a departure: the payload no longer names you. */
export const applyConversationUpdate = (
  updated: ApiGroupConversation,
  meId?: string,
) =>
  conversationsApi.util.updateQueryData(
    "getConversations",
    undefined,
    (draft) => {
      const index = draft.findIndex((row) => row._id === updated._id);

      const amStillMember =
        !meId ||
        (updated.participants ?? []).some((person) => person._id === meId);

      if (!amStillMember) {
        if (index !== -1) draft.splice(index, 1);
        return;
      }

      if (index === -1) {
        draft.unshift({ ...updated, updatedAt: new Date().toISOString() });
        return;
      }

      // Only a message may reorder the inbox, not a membership change.
      draft[index] = { ...updated, updatedAt: draft[index].updatedAt };
    },
  );
