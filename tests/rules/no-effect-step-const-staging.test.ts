import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("defragmentation");
const ruleName = "no-effect-step-const-staging";

describe("no-effect-step-const-staging", () => {
  it("It catches Effect steps staged in local consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 12 } } },
      { category: "plugin", severity: "error", location: { start: { line: 19 } } },
    ]);
  });

  it("It catches Effect pipelines staged in local consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-pipe-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 12 } } },
    ]);
  });

  it("It allows continuous Effect pipelines without intermediate step consts", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-effect-step-continuous-flow.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows complete Effect operations in a returned service API", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-service-effect-operations.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It catches intermediate steps beside and inside returned service operations", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-service-effect-intermediates.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 5 } } },
      { category: "plugin", severity: "error", location: { start: { line: 7 } } },
      { category: "plugin", severity: "error", location: { start: { line: 8 } } },
    ]);
  });

  it("It catches intermediate steps despite matching names in nested API returns", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-service-nested-return.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 4 } } },
      { category: "plugin", severity: "error", location: { start: { line: 15 } } },
    ]);
  });

  it("It allows typed and renamed operations and nested service factories", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-service-factory-scopes.ts"),
    );

    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It catches intermediate declarations outside the scope of a direct API return", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-service-return-scopes.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.diagnostics).toMatchObject([
      { category: "plugin", severity: "error", location: { start: { line: 6 } } },
      { category: "plugin", severity: "error", location: { start: { line: 14 } } },
      { category: "plugin", severity: "error", location: { start: { line: 21 } } },
    ]);
  });
});
