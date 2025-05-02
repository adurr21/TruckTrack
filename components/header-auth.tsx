import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
//import { Button } from "./ui/button";
import Button from '@mui/joy/Button'
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
        <Button type="submit" variant="solid" color="primary">
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <Button size="md" variant="solid">
        <Link href="/sign-in">Sign in</Link>
      </Button>
      <Button size="md" variant="solid">
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
