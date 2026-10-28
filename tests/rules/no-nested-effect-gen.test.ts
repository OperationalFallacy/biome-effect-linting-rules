import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports = 'import { Effect } from "effect";\n';

describe("no-nested-effect-gen", () => {
  for (const source of [
    "const task = Effect.gen(function* () { return yield* Effect.gen(function* () { return 1; }); });",
    "const make = Effect.gen(function* () { const fragment = Effect.gen(function* () { return 1; }); return yield* fragment; });",
    "const make = Effect.gen(function* () { const read = Effect.gen(function* () { const fragment = Effect.gen(function* () { return 1; }); return yield* fragment; }); return { read }; });",
    "const make = Effect.gen(function* () { const read = Effect.gen(function* () { const read = Effect.gen(function* () { return 1; }); return yield* read; }); return { read }; });",
    "const make = Effect.gen(function* () { const read = Effect.gen(function* () { return 1; }); return { nested: { read } }; });",
  ]) {
    it(`It catches a generator fragment inside one operation: ${source}`, () => {
      const result = lintSourceWithRule("no-nested-effect-gen", imports + source);
      expect(result.status).toBe(1);
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]).toMatchObject({
        category: "plugin",
        severity: "error",
        location: { start: { line: 2 } },
      });
    });
  }

  for (const source of [
    "const make = Effect.gen(function* () { const read = Effect.gen(function* () { return 1; }); return { read }; });",
    "const make = Effect.gen(function* () { const read = Effect.gen(function* () { return 1; }); return { load: read }; });",
    "const make = Effect.gen(function* () { const read = Effect.fn('read')(function* () { return 1; }); return { read }; });",
  ]) {
    it(`It allows a complete operation exposed through the service API: ${source}`, () => {
      const result = lintSourceWithRule("no-nested-effect-gen", imports + source);
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
