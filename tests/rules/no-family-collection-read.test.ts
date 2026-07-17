import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-family-collection-read");
const ruleName = "no-family-collection-read";

describe("no-family-collection-read", () => {
  it("It catches keyed family reads of collection atoms through get", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-get.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("Keyed projection atom reads collection atom.");
  });

  it("It catches keyed family reads of visible atoms through get.get", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-get-get.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("Keyed projection atom reads collection atom.");
  });

  it("It catches keyed family reads of results atoms through Atom.get", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-atom-get.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("Keyed projection atom reads collection atom.");
  });

  it("It allows keyed family reads from source and index atoms", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-keyed-source.ts"));
    expect(result.status).toBe(0);
  });

  it("It allows collection atom reads outside Atom.family", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-outside-family.ts"));
    expect(result.status).toBe(0);
  });
});
