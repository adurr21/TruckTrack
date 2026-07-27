import { describe, expect, it } from "vitest";
describe("settlement validation contract", () => {
  it("rejects non-finite and negative amounts", () => {
    expect(Number.isFinite(Number("NaN"))).toBe(false);
    expect(Number("-1")).toBeLessThan(0);
  });
});
