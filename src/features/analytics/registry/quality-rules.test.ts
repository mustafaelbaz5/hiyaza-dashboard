import { describe, expect, it } from "vitest";
import { QUALITY_RULES } from "./quality-rules";

describe("QUALITY_RULES", () => {
  it("has a unique key per rule", () => {
    const keys = QUALITY_RULES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("every rule has a non-empty Arabic label", () => {
    for (const rule of QUALITY_RULES) {
      expect(rule.label.length).toBeGreaterThan(0);
    }
  });
});
