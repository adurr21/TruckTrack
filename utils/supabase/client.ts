import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import type { Database } from "@/types/database";

export const createClient = () =>
  (() => {
    const { url, anonKey } = getSupabaseConfig();
    return createBrowserClient<Database>(url, anonKey);
  })();
