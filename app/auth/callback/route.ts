import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY" },
      { status: 500 }
    );
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  // Always redirect to a relative path.
  const safeNext = next.startsWith("/") ? next : "/";

  const response = NextResponse.redirect(new URL(safeNext, requestUrl.origin));

  if (!code) return response;

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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // If exchange fails, send back to the appropriate login page.
    const loginPath = safeNext.startsWith("/seller") ? "/seller/login" : "/login";
    return NextResponse.redirect(
      new URL(`${loginPath}?next=${encodeURIComponent(safeNext)}`, requestUrl.origin)
    );
  }

  return response;
}
