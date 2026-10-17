import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-empty-vanilla-extract-style");
const ruleName = "no-empty-vanilla-extract-style";

describe(ruleName, () => {
  it("It catches empty Vanilla Extract declarations", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-empty-style.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 3 } } },
    ]);
  });

  it("It allows declarations with an implemented visual contract", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-token-backed-style.css.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
