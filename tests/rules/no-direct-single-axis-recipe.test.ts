import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-direct-single-axis-recipe");
const ruleName = "no-direct-single-axis-recipe";

describe(ruleName, () => {
  it("It rejects a one-axis recipe that selects one complete class", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-direct-recipe.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("use styleVariants");
  });

  it.each([
    "valid-coordinated-recipe.css.ts",
    "valid-multiple-axis-recipe.css.ts",
  ])("It allows coordinated recipe behavior in %s", (fixture) => {
    const result = lintWithRule(ruleName, path.join(fixtures, fixture));

    expect(result.status).toBe(0);
  });
});
