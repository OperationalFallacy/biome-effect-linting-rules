import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-effect-wrapper-alias");

describe("no-effect-wrapper-alias", () => {
  it("It catches local Effect wrapper aliases", () => {
    const result = lintWithRule(
      "no-effect-wrapper-alias",
      path.join(fixtures, "invalid-effect-wrapper-alias.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("Rule: avoid Effect wrapper aliases");
  });

  it("It allows plain domain functions", () => {
    const result = lintWithRule(
      "no-effect-wrapper-alias",
      path.join(fixtures, "valid-domain-function.ts"),
    );

    expect(result.status).toBe(0);
  });
});
