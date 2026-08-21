import Cookies from "js-cookie";

export const AUTH_COOKIE = "ch-app-acc-token";

/** The API's JWT is HS256 with a 7-day life. The cookie expires with it. */
const TOKEN_LIFETIME_DAYS = 7;

export function getToken(): string | undefined {
  return Cookies.get(AUTH_COOKIE);
}

export function setToken(token: string): void {
  Cookies.set(AUTH_COOKIE, token, {
    expires: TOKEN_LIFETIME_DAYS,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearToken(): void {
  Cookies.remove(AUTH_COOKIE, { path: "/" });
}
