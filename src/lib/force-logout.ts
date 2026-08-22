import { clearToken } from "./auth-token";

export const forceLogout = (): void => {
  clearToken();

  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/login")) return;

  const next = encodeURIComponent(
    window.location.pathname + window.location.search,
  );
  window.location.replace(`/login?next=${next}`);
};
