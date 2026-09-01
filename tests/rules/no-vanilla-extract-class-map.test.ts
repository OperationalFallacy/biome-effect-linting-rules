import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-vanilla-extract-class-map");
const ruleName = "no-vanilla-extract-class-map";

describe(ruleName, () => {
  it("It catches exported objects assembled from generated classes", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-exported-class-map.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("do not assemble generated classes");
  });

  it("It allows direct classes and generated style variants", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-style-variants.css.ts"),
    );

    expect(result.status).toBe(0);
  });
});
