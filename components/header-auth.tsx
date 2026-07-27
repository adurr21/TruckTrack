import { signOutAction } from "@/app/actions";
import Link from "next/link";
import Button from "@mui/joy/Button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("users")
        .select("name")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {profile?.name || user.email || "there"}!
      <form action={signOutAction}>
        <Button type="submit" variant="solid" color="primary">
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Link
        className="rounded-md bg-primary px-4 py-2 text-white"
        href="/sign-in"
      >
        Sign in
      </Link>
      <Link
        className="rounded-md bg-primary px-4 py-2 text-white"
        href="/sign-up"
      >
        Sign up
      </Link>
    </div>
  );
}
