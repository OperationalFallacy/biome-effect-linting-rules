import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("defragmentation");
const ruleName = "no-pipeline-fragment-staging";

describe("no-pipeline-fragment-staging", () => {
  it("It catches local pipeline fragments consumed by returned pipelines", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-pipeline-fragment-return.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 9 } } },
    ]);
  });

  it("It allows final domain values before continuous returned pipelines", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-pipeline-final-domain-value.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows nested render callback composition inside result matching", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-nested-render-callback-composition.tsx"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
