import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "./config";
import { canAccessProtectedRoute } from "./auth-state";

export const updateSession = async (request: NextRequest) => {
  const isProtected = request.nextUrl.pathname.startsWith("/protected");
  let response = NextResponse.next({ request: { headers: request.headers } });
  try {
    const { url, anonKey } = getSupabaseConfig();

    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();

    // protected routes
    if (isProtected && !canAccessProtectedRoute(user)) {
      const redirect = NextResponse.redirect(new URL("/sign-in", request.url));
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }

    if (request.nextUrl.pathname === "/" && canAccessProtectedRoute(user)) {
      return NextResponse.redirect(new URL("/protected", request.url));
    }

    return response;
  } catch {
    if (isProtected) {
      const redirect = NextResponse.redirect(
        new URL("/sign-in?error=auth_unavailable", request.url),
      );
      response.cookies
        .getAll()
        .forEach((cookie) => redirect.cookies.set(cookie));
      return redirect;
    }
    return response;
  }
};
