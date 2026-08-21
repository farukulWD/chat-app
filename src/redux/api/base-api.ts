import { axiosBaseQuery } from "@/helpers/axios";
import { createApi } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["User", "Conversation", "Message"],
  endpoints: () => ({}),
});
