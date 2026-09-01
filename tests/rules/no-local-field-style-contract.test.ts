import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-local-field-style-contract");
const ruleName = "no-local-field-style-contract";

describe(ruleName, () => {
  it("It catches component-local declarations for shared field roles", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-local-field.css.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("do not recreate shared field roles");
  });

  it("It allows the shared field foundation contracts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-shared-field.css.ts"),
    );

    expect(result.status).toBe(0);
  });
});
