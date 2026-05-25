import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@heroui/react";
import Link from "next/link";

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex-1 flex flex-col min-w-64 max-w-64 mx-auto">
      <h1 className="text-2xl font-medium">Sign in</h1>
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-primary font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>
      <div className="flex flex-col gap-4 mt-8">
        <Input
          name="email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          required
        />
        <Input
          type="password"
          name="password"
          label="Password"
          placeholder="Your password"
          required
          // description={
          //   <Link className="text-xs underline" href="/forgot-password">
          //     Forgot Password?
          //   </Link>
          // }
        />
        <SubmitButton pendingText="Signing In..." formAction={signInAction} color="primary">
          Sign in
        </SubmitButton>
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
