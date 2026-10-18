import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("defragmentation");
const ruleName = "no-effect-step-const-staging";

describe("no-effect-step-const-staging", () => {
  it("It catches Effect steps staged in local consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 12 } } },
      { category: "plugin", severity: "error", location: { start: { line: 19 } } },
    ]);
  });

  it("It catches Effect pipelines staged in local consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-pipe-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 12 } } },
    ]);
  });

  it("It allows continuous Effect pipelines without intermediate step consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-effect-step-continuous-flow.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
