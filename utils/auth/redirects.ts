const LOCAL_PATH = /^\/(?!\/)[^\\\n\r]*$/;

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const value =
    configured ||
    (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:")
      throw new Error("Invalid site URL");
    return url.origin;
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be a valid HTTP(S) URL");
  }
}

export function getLocalRedirectPath(
  value: string | null | undefined,
  fallback = "/protected",
) {
  return value && LOCAL_PATH.test(value) ? value : fallback;
}

export function getAuthCallbackUrl(path = "/auth/callback") {
  return new URL(path, getSiteUrl()).toString();
}
