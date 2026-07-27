import HeaderAuth from "@/components/header-auth";
import { unstable_noStore as noStore } from "next/cache";

export default function RuntimeAuthNav() {
  noStore();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return null;
  }

  return <HeaderAuth />;
}
