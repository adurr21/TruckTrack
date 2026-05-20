import Link from "next/link";
import { Button, Chip } from "@heroui/react";

export function EnvVarWarning() {
  return (
    <div className="flex gap-4 items-center">
      <Chip variant="flat" className="font-normal">
        Supabase environment variables required
      </Chip>
      <div className="flex gap-2">
        <Button
          as={Link}
          href="/sign-in"
          size="sm"
          variant="bordered"
          isDisabled
          className="opacity-75"
        >
          Sign in
        </Button>
        <Button
          as={Link}
          href="/sign-up"
          size="sm"
          isDisabled
          className="opacity-75"
        >
          Sign up
        </Button>
      </div>
    </div>
  );
}
