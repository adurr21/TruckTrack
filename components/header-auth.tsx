import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "@heroui/react";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user?.id)
    .single();
    
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {profile.name}!
      <form action={signOutAction}>
        <Button 
          type="submit" 
          color="primary"
          variant="solid"
          isLoading={false}
        >
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button 
        as={Link}
        href="/sign-in"
        color="primary"
        variant="solid"
      >
        Sign in
      </Button>
      <Button 
        as={Link}
        href="/sign-up"
        color="primary"
        variant="solid"
      >
        Sign up
      </Button>
    </div>
  );
}
