import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/auth-token";
import { isTokenExpired } from "@/lib/utils";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const signedIn = Boolean(token) && !isTokenExpired(token as string);

  if (pathname.startsWith("/login")) {
    if (signedIn) {
      return NextResponse.redirect(new URL("/chat", request.url));
    }
    return NextResponse.next();
  }

  if (!signedIn) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);

    const response = NextResponse.redirect(login);
    if (token) response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login"],
};
