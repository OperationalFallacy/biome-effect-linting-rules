import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-return-in-arrow");
const diagnostic =
  "Rule: review this block-bodied arrow callback before changing it. Identify its role in the surrounding data or Effect flow, then aim for a result that makes the data, state, and collection choices clearer rather than merely changing the callback shape. For example, when a reducer rebuilds a native `Map` on every step, an Effect `HashMap` update such as `HashMap.set` may express the operation directly. Keep the block when it communicates the design most clearly.";

describe("no-return-in-arrow", () => {
  it("It catches block-bodied arrow callbacks with returns", () => {
    const result = lintWithRule(
      "no-return-in-arrow",
      path.join(fixtures, "invalid-callback-return.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.output).toContain(diagnostic);
  });

  it("It allows Schema.filter predicate returns", () => {
    const result = lintWithRule(
      "no-return-in-arrow",
      path.join(fixtures, "valid-schema-filter-return.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.output).not.toContain(diagnostic);
  });
});
