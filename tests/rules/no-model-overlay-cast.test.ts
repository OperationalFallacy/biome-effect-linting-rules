import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-model-overlay-cast");
const ruleName = "no-model-overlay-cast";

describe("no-model-overlay-cast", () => {
  it("flags a genuine cast to a named type", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-named-type.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("avoid `as` assertions on decoded model flow");
  });

  it("allows `as const` on a tuple literal", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-as-const-tuple.ts"));
    expect(result.status).toBe(0);
  });

  it("allows `as const` on a primitive literal", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-as-const-literal.ts"));
    expect(result.status).toBe(0);
  });
});
