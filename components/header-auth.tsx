import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "@heroui/react";
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
        <Button type="submit" color="primary" variant="solid" isLoading={false}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button as={Link} href="/sign-in" color="primary" variant="solid">
        Sign in
      </Button>
      <Button as={Link} href="/sign-up" color="primary" variant="solid">
        Sign up
      </Button>
    </div>
  );
}
