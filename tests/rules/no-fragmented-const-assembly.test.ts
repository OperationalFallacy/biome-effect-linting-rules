import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("defragmentation");
const ruleName = "no-fragmented-const-assembly";

describe("no-fragmented-const-assembly", () => {
  it("It catches direct const fragments used inside const function object assembly", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-direct-const-fragment.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 19 } } },
    ]);
  });

  it("It catches second-level const assembly chains", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-assembly-chain.ts"));

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 20 } } },
    ]);
  });

  it("It catches helper fragments spread into constructor payloads", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-constructor-fragment.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 26 } } },
    ]);
  });

  it("It allows Data tagged enum declarations and explicit final object contracts", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-const-assembly.ts"));

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows React presentation tables, hook key derivation, and local JSX render helpers", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-react-presentation-composition.tsx"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows atom projection helpers and stable service error adapters", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-atom-projection-and-error-adapters.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
