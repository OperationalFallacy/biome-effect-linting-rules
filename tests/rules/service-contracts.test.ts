import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports = 'import { Context, Effect, Layer, Ref, pipe } from "effect";\n';

describe("Service contracts", () => {
  for (const operation of [
    "pipe(Effect.succeed(1), Effect.map((n) => n + 1))",
    "() => Effect.succeed(1)",
    "(id: number) => pipe(Effect.succeed(id), Effect.map((n) => n + 1))",
  ]) {
    it(`It allows a returned API operation defined as ${operation}`, () => {
      const result = lintSourceWithRule(
        "no-effect-wrapper-alias",
        imports + `function makeApi() { const read = ${operation}; return { read }; }`,
      );
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }

  it("It catches intermediate wrappers inside a returned API operation", () => {
    const result = lintSourceWithRule(
      "no-effect-wrapper-alias",
      imports +
        "function makeApi() { const read = Effect.fn('read')(function* () { const fragment = () => Effect.succeed(1); return yield* fragment(); }); return { read }; }",
    );
    expect(result.status).toBe(1);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      category: "plugin",
      severity: "error",
      location: { start: { line: 2 } },
    });
  });

  it("It allows Effect types in a Context.Service public contract", () => {
    const result = lintSourceWithRule(
      "no-manual-effect-channels",
      imports +
        `class Counter extends Context.Service<Counter, { readonly read: Effect.Effect<number>; readonly increment: (n: number) => Effect.Effect<number>; }>()("example/Counter") {}`,
    );
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
  it("It allows Effect types in an interface without an implementation to infer", () => {
    const result = lintSourceWithRule(
      "no-manual-effect-channels",
      imports +
        "export interface Counter { read(): Effect.Effect<number>; increment(n: number): Effect.Effect<number>; }",
    );
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It catches an implementation annotation beside a valid public contract", () => {
    const result = lintSourceWithRule(
      "no-manual-effect-channels",
      imports +
        "interface Counter { read(): Effect.Effect<number>; } function read(): Effect.Effect<number> { return Effect.succeed(1); }",
    );
    expect(result.status).toBe(1);
    expect(result.diagnostics).toHaveLength(1);
    expect(result.diagnostics[0]).toMatchObject({
      category: "plugin",
      severity: "error",
      location: { start: { line: 2 } },
    });
  });
});
