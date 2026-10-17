import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-return-in-arrow");
const diagnostic =
  "This rule asks you to review a callback with an explicit return. Read its role in the operation and check whether the data, state, or collection choices can be clearer. For example, a reducer that copies a native Map on every step may be clearer as an Effect HashMap update with HashMap.set. Use an expression for a single result, and keep the block when local bindings or several steps explain the operation better.";

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
