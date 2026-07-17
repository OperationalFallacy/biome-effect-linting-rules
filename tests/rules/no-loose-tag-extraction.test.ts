import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-loose-tag-extraction");
const ruleName = "no-loose-tag-extraction";

describe(ruleName, () => {
  it("It catches loose tag extraction from unknown", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-loose-tag-extraction.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("Rule: avoid loose `_tag` extraction from `unknown`.");
  });

  it("It allows matching a typed tagged union", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-typed-tagged-union.ts"),
    );

    expect(result.status).toBe(0);
  });
});
