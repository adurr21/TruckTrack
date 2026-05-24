import { createBrowserClient } from "@supabase/ssr";

declare global {
  interface Window {
    __TRUCKTRACK_ENV?: {
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    };
  }
}

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

function getSupabaseBrowserEnv() {
  if (typeof window !== "undefined") {
    return {
      url: window.__TRUCKTRACK_ENV?.NEXT_PUBLIC_SUPABASE_URL ?? "",
      anonKey: window.__TRUCKTRACK_ENV?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    };
  }

  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export const createClient = () => {
  const { url, anonKey } = getSupabaseBrowserEnv();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables are missing from the running application.",
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, anonKey);
  }

  return browserClient;
};
