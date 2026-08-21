"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth-token";
import { baseApi } from "@/redux/api/base-api";
import { clearCredentials } from "@/redux/features/auth/auth-slice";
import { useAppDispatch } from "@/redux/hooks";

export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(() => {
    clearToken();
    dispatch(clearCredentials());
    dispatch(baseApi.util.resetApiState());
    router.replace("/login");
    router.refresh();
  }, [dispatch, router]);
}
