import { describe, expect, it } from "vitest";
import { canAccessProtectedRoute } from "@/utils/supabase/auth-state";

describe("protected route auth decisions", () => {
  it("allows an authenticated user", () =>
    expect(
      canAccessProtectedRoute({ data: { user: { id: "u" } }, error: null }),
    ).toBe(true));
  it("rejects an unauthenticated request", () =>
    expect(canAccessProtectedRoute({ data: { user: null }, error: null })).toBe(
      false,
    ));
  it("rejects expired sessions", () =>
    expect(
      canAccessProtectedRoute({
        data: { user: null },
        error: new Error("expired"),
      }),
    ).toBe(false));
  it("rejects Supabase errors even if a stale user object exists", () =>
    expect(
      canAccessProtectedRoute({
        data: { user: { id: "u" } },
        error: new Error("network"),
      }),
    ).toBe(false));
});
