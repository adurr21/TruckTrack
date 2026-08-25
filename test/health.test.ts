import { describe, expect, it } from "vitest";
import { GET } from "@/app/health/route";

describe("health endpoint", () => {
  it("responds without requiring authentication", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    await expect(response.text()).resolves.toBe("ok\n");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
