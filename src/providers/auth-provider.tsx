"use client";

import { useEffect, useSyncExternalStore } from "react";
import { clearToken, getToken } from "@/lib/auth-token";
import { useGetMeQuery } from "@/redux/api/auth-api";
import { clearCredentials } from "@/redux/features/auth/auth-slice";
import { useAppDispatch } from "@/redux/hooks";

const noSubscription = () => () => {};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  const token = useSyncExternalStore(
    noSubscription,
    () => getToken() ?? null,
    () => null,
  );

  const hydrated = useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

  const { isError } = useGetMeQuery(undefined, { skip: !token });

  useEffect(() => {
    if (hydrated && !token) dispatch(clearCredentials());
  }, [hydrated, token, dispatch]);

  useEffect(() => {
    if (isError) clearToken();
  }, [isError]);

  return <>{children}</>;
}
