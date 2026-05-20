import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@heroui/react";

export default async function ResetPassword(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  return (
    <form className="flex flex-col w-full max-w-md gap-4">
      <h1 className="text-2xl font-medium">Reset password</h1>
      <p className="text-sm text-foreground/60">
        Please enter your new password below.
      </p>
      <Input
        type="password"
        name="password"
        label="New password"
        placeholder="New password"
        required
      />
      <Input
        type="password"
        name="confirmPassword"
        label="Confirm password"
        placeholder="Confirm password"
        required
      />
      <SubmitButton formAction={resetPasswordAction} color="primary">
        Reset password
      </SubmitButton>
      <FormMessage message={searchParams} />
    </form>
  );
}
