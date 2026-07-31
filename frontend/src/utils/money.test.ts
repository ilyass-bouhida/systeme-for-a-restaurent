import { calculateChange, dirhamsToCents, formatMoney } from "@/utils/money";
import { describe, expect, it } from "vitest";

describe("money utilities", () => {
  it("converts dirhams to integer centimes", () => {
    expect(dirhamsToCents("180.50")).toBe(18050);
  });

  it("calculates non-negative change", () => {
    expect(calculateChange(18000, 20000)).toBe(2000);
    expect(calculateChange(20000, 18000)).toBe(0);
  });

  it("formats money as Moroccan dirhams", () => {
    expect(formatMoney(18000)).toContain("180");
    expect(formatMoney(18000)).toContain("MAD");
  });
});
