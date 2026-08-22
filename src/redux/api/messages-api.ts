import { baseApi } from "./base-api";
import type {
  ApiMessage,
  ApiMessageListResponse,
  MessagePageRequest,
  SendMessageRequest,
} from "@/types/api";

export const MESSAGE_PAGE_SIZE = 25;

const byOldestFirst = (a: ApiMessage, b: ApiMessage): number => {
  const delta = Date.parse(a.createdAt) - Date.parse(b.createdAt);
  return delta !== 0 ? delta : a._id.localeCompare(b._id);
};

const dedupe = (messages: ApiMessage[]): ApiMessage[] => {
  const byId = new Map<string, ApiMessage>();
  for (const message of messages) byId.set(message._id, message);
  return [...byId.values()].sort(byOldestFirst);
};

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMessages: build.query<ApiMessageListResponse, MessagePageRequest>({
      query: ({ conversationId, before }) => ({
        url: `/conversations/${conversationId}/messages`,
        method: "GET",
        params: { limit: MESSAGE_PAGE_SIZE, ...(before ? { before } : {}) },
      }),
      serializeQueryArgs: ({ queryArgs }) => queryArgs.conversationId,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.before !== previousArg?.before,
      transformResponse: (response: ApiMessageListResponse) => ({
        messages: dedupe(response?.messages ?? []),
        hasMore: Boolean(response?.hasMore),
      }),
      merge: (cache, incoming, { arg }) => {
        const known = new Set(cache.messages.map((message) => message._id));
        const added = incoming.messages.filter(
          (message) => !known.has(message._id),
        );

        cache.messages = dedupe([...cache.messages, ...incoming.messages]);

        if (arg.before) {
          cache.hasMore = added.length > 0 && incoming.hasMore;
        }
      },
      providesTags: (_result, _error, { conversationId }) => [
        { type: "Message" as const, id: conversationId },
      ],
    }),

    sendMessage: build.mutation<ApiMessage | null, SendMessageRequest>({
      query: (data) => ({ url: "/messages", method: "POST", data }),
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = messagesApi;

export function upsertCachedMessage(message: ApiMessage) {
  return messagesApi.util.updateQueryData(
    "getMessages",
    { conversationId: message.conversation },
    (draft) => {
      draft.messages = dedupe([...draft.messages, message]);
    },
  );
}
