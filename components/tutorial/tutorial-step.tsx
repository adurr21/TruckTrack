import { Checkbox } from "@heroui/react";

export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative flex gap-4">
      <Checkbox id={title} name={title} className="mt-1" />
      <div className="flex-1">
        <label
          htmlFor={title}
          className="text-base text-foreground font-medium cursor-pointer"
        >
          {title}
        </label>
        <div className="text-sm text-foreground/70 font-normal mt-1">
          {children}
        </div>
      </div>
    </li>
  );
}
