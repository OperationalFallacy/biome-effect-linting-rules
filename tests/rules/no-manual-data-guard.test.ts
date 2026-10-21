import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-manual-data-guard");
const ruleName = "no-manual-data-guard";

describe(ruleName, () => {
  it("It catches structural manual data guards", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-structural-guards.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 10 } } },
      { category: "plugin", severity: "error", location: { start: { line: 14 } } },
    ]);
  });

  it("It catches primitive refinement of unknown data", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-primitive-refinement.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 6 } } },
    ]);
  });

  it("It allows Schema decoding and Match discrimination", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-schema-and-match.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows typed narrowing and nominal identity checks", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-type-predicates.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
