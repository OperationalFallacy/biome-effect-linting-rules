import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports = 'import { Effect } from "effect";\n';

describe("Effect call composition", () => {
  for (const source of [
    "const task = Effect.map(Effect.succeed(1), (n) => n + 1);",
    "const task = Effect.acquireUseRelease(Effect.succeed(1), use, release);",
    "const task = Effect.andThen(first, Effect.succeed(1));",
  ]) {
    it(`It catches a nested Effect argument across call arities: ${source}`, () => {
      const result = lintSourceWithRule("no-call-tower", imports + source);
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
    "const task = Effect.succeed(1).pipe(Effect.map((n) => n + 1));",
    "const task = Effect.flatMap(first, Effect.fn(function* (n) { return n + 1; }));",
    "const task = Effect.flatMap(first, Effect.fnUntraced(function* (n) { return n + 1; }));",
    "const task = Effect.flatMap(first, Effect.fnUntracedEager(function* (n) { return n + 1; }));",
    "const result = Effect.runSync(Effect.succeed(1));",
    "const result = Effect.runSyncExit(Effect.succeed(1));",
  ]) {
    it(`It allows function callbacks or application runners: ${source}`, () => {
      const result = lintSourceWithRule("no-call-tower", imports + source);
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
