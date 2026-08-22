import { baseApi } from "./base-api";
import type { ApiConversation, ApiConversationListResponse } from "@/types/api";

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<ApiConversation[], void>({
      query: () => ({ url: "/conversations", method: "GET" }),
      transformResponse: (response: ApiConversationListResponse) =>
        response?.data ?? [],
      providesTags: ["Conversation"],
    }),
  }),
});

export const { useGetConversationsQuery } = conversationsApi;
