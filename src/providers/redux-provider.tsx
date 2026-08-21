"use client";

import { AppStore, makeStore } from "@/redux/store";
import { useState } from "react";
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

  return <Provider store={store}>{children}</Provider>;
}
