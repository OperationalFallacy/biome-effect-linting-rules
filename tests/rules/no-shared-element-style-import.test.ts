import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-shared-element-style-import");
const ruleName = "no-shared-element-style-import";

describe(ruleName, () => {
  it("It catches application-alias imports of shared-element styling", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-alias-import.tsx"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("cannot import shared-element styling modules");
  });

  it("It catches relative traversal into shared-element styling", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-relative-import.tsx"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain("cannot import shared-element styling modules");
  });

  it("It allows a shared element to import its matching local styling", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-local-style-import.tsx"),
    );

    expect(result.status).toBe(0);
  });

  it("It allows consumers to import the public shared component", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-component-import.tsx"),
    );

    expect(result.status).toBe(0);
  });
});
