import { describe, expect, it } from "vitest";
import { ok, err } from "./result";

describe("Result", () => {
  it("wraps a success value", () => {
    const result = ok(42);
    expect(result).toEqual({ ok: true, value: 42 });
  });

  it("wraps a failure value", () => {
    const result = err("boom");
    expect(result).toEqual({ ok: false, error: "boom" });
  });
});
