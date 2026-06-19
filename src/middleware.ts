import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

function stripLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|hi|or|bn)(\/.*)?$/);
  if (match) return match[2] || "/";
  return pathname;
}

export default auth((req) => {
  const path = stripLocale(req.nextUrl.pathname);
  const locale =
    req.nextUrl.pathname.match(/^\/(en|hi|or|bn)/)?.[1] ??
    routing.defaultLocale;
  const isLoggedIn = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (path.startsWith("/dashboard") && !isLoggedIn) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }

  if (
    path.startsWith("/admin") &&
    !path.startsWith("/admin/login") &&
    !isLoggedIn
  ) {
    return NextResponse.redirect(new URL(`/${locale}/admin/login`, req.url));
  }

  if (
    path.startsWith("/admin") &&
    !path.startsWith("/admin/login") &&
    isLoggedIn &&
    !isAdmin
  ) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  if (path === "/login" && isLoggedIn && !isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, req.url));
  }

  if (path === "/admin/login" && isLoggedIn && isAdmin) {
    return NextResponse.redirect(new URL(`/${locale}/admin`, req.url));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/", "/(en|hi|or|bn)/:path*"],
};
