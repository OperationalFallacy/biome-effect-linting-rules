import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-switch-statement");
const ruleName = "no-switch-statement";
const diagnosticMessage = "Rule: avoid imperative switch branching.";

describe("no-switch-statement", () => {
  it("It catches switch statements in files that import from 'effect'", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-switch.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches switch statements in files that import from 'effect/<module>'", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "invalid-switch-submodule-import.ts"),
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches switch statements in files that import from '@effect-atom/atom-react'", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "invalid-switch-atom-react.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It allows Match.value pipelines in place of a switch", () => {
    const result = lintWithRule(ruleName, path.join(fixtures, "valid-match-value.ts"));
    expect(result.status).toBe(0);
  });

  it("It allows switch statements in files without an Effect-ecosystem import", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-switch-without-effect.ts"),
    );
    expect(result.status).toBe(0);
  });
});
