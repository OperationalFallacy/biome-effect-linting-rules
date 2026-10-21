import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-model-overlay-cast");
const ruleName = "no-model-overlay-cast";

describe("no-model-overlay-cast", () => {
  it("It catches assertions to a named model type", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-named-type.ts"));
    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 10 } } },
    ]);
  });

  it("It allows as const on a tuple literal", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-as-const-tuple.ts"));
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows as const on a primitive literal", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-as-const-literal.ts"));
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
