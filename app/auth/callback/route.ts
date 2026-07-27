import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getLocalRedirectPath, getSiteUrl } from "@/utils/auth/redirects";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = getSiteUrl();
  const redirectTo = getLocalRedirectPath(
    requestUrl.searchParams.get("redirect_to"),
  );

  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=missing_code", origin),
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error)
      return NextResponse.redirect(
        new URL("/sign-in?error=auth_callback", origin),
      );
  } catch {
    return NextResponse.redirect(
      new URL("/sign-in?error=auth_unavailable", origin),
    );
  }

  return NextResponse.redirect(new URL(redirectTo, origin));
}
