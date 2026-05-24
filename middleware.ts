import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

type Role = "customer" | "seller" | "admin";

function getRedirectPath(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  return `${pathname}${search}`;
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env is not configured, don't block routes (helps local dev bootstrapping).
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isSellerRoute = pathname.startsWith("/seller");
  const isSellerLogin = pathname === "/seller/login";
  const isOrdersRoute = pathname.startsWith("/orders");
  const isProfileSetupRoute = pathname.startsWith("/profile/setup");

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Helper that preserves any Supabase auth cookie updates.
  function redirectWithCookies(to: URL) {
    const r = NextResponse.redirect(to);
    // Copy cookies (if any were set by Supabase) onto redirect response.
    response.cookies.getAll().forEach((c) => {
      r.cookies.set(c);
    });
    return r;
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Customer-protected routes
  if ((isOrdersRoute || isProfileSetupRoute) && !user) {
    const next = getRedirectPath(request);
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", next);
    return redirectWithCookies(loginUrl);
  }

  // Seller-protected routes
  if (isSellerRoute) {
    if (isSellerLogin) {
      // If already seller/admin, skip login page.
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        const role = (profile?.role ?? "customer") as Role;
        if (role === "seller" || role === "admin") {
          const dash = request.nextUrl.clone();
          dash.pathname = "/seller";
          dash.search = "";
          return redirectWithCookies(dash);
        }
      }

      return response;
    }

    if (!user) {
      const next = getRedirectPath(request);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/seller/login";
      loginUrl.searchParams.set("next", next);
      return redirectWithCookies(loginUrl);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = (profile?.role ?? "customer") as Role;

    if (role !== "seller" && role !== "admin") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/seller/login";
      loginUrl.searchParams.set("reason", "forbidden");
      return redirectWithCookies(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Run on all routes except Next internals/static files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
