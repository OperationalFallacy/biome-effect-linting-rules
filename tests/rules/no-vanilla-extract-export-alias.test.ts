import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-vanilla-extract-export-alias");
const ruleName = "no-vanilla-extract-export-alias";

describe(ruleName, () => {
  it("It catches a generated class published under a second name", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-style-alias.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 5 } } },
    ]);
  });

  it("It catches an exported generated class published again", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-exported-style-alias.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 4 } } },
    ]);
  });

  it("It allows direct class exports and unrelated metadata", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-direct-style.css.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
