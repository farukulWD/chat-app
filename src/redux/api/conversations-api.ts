import { baseApi } from "./base-api";
import type {
  ApiConversation,
  ApiConversationListResponse,
  ApiDirectConversationCreated,
  ApiGroupConversation,
  CreateDirectRequest,
  CreateGroupRequest,
} from "@/types/api";

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
  }),
});

export const {
  useGetConversationsQuery,
  useCreateDirectConversationMutation,
  useCreateGroupConversationMutation,
} = conversationsApi;
