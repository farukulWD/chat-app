import { baseApi } from "./base-api";
import type { LoginRequest, LoginResponse, User } from "@/types/auth";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, LoginRequest>({
      query: (data) => ({ url: "/auth/login", method: "POST", data }),
      invalidatesTags: ["User"],
    }),
    getMe: build.query<User, void>({
      query: () => ({ url: "/auth/me", method: "GET" }),
      providesTags: ["User"],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
