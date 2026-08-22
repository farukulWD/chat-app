"use client";

import { AppStore, makeStore } from "@/redux/store";
import { setupListeners } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { Provider } from "react-redux";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [store] = useState<AppStore>(() => {
    const newStore = makeStore();
    return newStore;
  });

  // Powers `refetchOnReconnect` — inert without it. Focus refetching stays
  // off: every tab focus hitting a possibly-cold instance costs more than a
  // slightly stale list.
  useEffect(() => setupListeners(store.dispatch), [store]);

  return <Provider store={store}>{children}</Provider>;
}
