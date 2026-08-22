import { baseApi } from "./base-api";
import type { ApiUser } from "@/types/api";

/** The endpoint truncates at 50 rows and says nothing about it — no `total`,
 *  no `hasMore`, and no `limit` parameter to raise it. A full page is
 *  therefore indistinguishable from a truncated one, so treat it as truncated. */
export const SEARCH_RESULT_CAP = 50;

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchUsers: build.query<ApiUser[], string>({
      query: (q) => ({ url: "/users/search", method: "GET", params: { q } }),
      keepUnusedDataFor: 30,
    }),
  }),
});

export const { useSearchUsersQuery } = usersApi;
