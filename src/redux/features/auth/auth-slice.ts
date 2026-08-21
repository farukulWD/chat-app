import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authApi } from "@/redux/api/auth-api";
import type { AuthStatus, User } from "@/types/auth";

type AuthState = {
  user: User | null;
  status: AuthStatus;
};

const initialState: AuthState = {
  user: null,
  status: "unknown",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.user = null;
      state.status = "anonymous";
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.user = action.payload.user;
        state.status = "authenticated";
      })
      .addMatcher(authApi.endpoints.getMe.matchFulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addMatcher(authApi.endpoints.getMe.matchRejected, (state) => {
        state.user = null;
        state.status = "anonymous";
      });
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
