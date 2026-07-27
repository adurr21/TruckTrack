import { describe, expect, it } from "vitest";
import { getLocalRedirectPath } from "@/utils/auth/redirects";
describe("auth redirect validation", () => {
  it.each([
    ["/protected", "/protected"],
    ["/protected/reset-password", "/protected/reset-password"],
    ["https://evil.example", "/protected"],
    ["//evil.example", "/protected"],
    [null, "/protected"],
  ])("validates %s", (value, expected) =>
    expect(getLocalRedirectPath(value)).toBe(expected),
  );
});
