import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports = 'import { Effect, Layer } from "effect";\n';

describe("no-inline-runtime-provide", () => {
  for (const provided of ["task.pipe(Effect.provide(layer))", "Effect.provide(task, layer)"]) {
    for (const owner of [
      `Effect.gen(function* () { return yield* ${provided}; })`,
      `Effect.fn("load")(function* () { return yield* ${provided}; })`,
      `Effect.fn(function* () { return yield* ${provided}; })`,
      `Effect.fnUntraced(function* () { return yield* ${provided}; })`,
      `Effect.fnUntracedEager(function* () { return yield* ${provided}; })`,
    ]) {
      it(`It catches service graph construction inside ${owner}`, () => {
        const result = lintSourceWithRule(
          "no-inline-runtime-provide",
          imports + `const load = ${owner};`,
        );
        expect(result.status).toBe(1);
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0]).toMatchObject({
          category: "plugin",
          severity: "error",
          location: { start: { line: 2 } },
        });
      });
    }
  }

  for (const source of [
    "const main = task.pipe(Effect.provide(layer)); Effect.runPromise(main);",
    "const main = Effect.provide(task, layer); Effect.runFork(main);",
    "const live = Layer.effect(Service, make).pipe(Layer.provide(Dependencies));",
    "const load = Effect.gen(function* () { return yield* task.pipe(Effect.provideService(Request, request)); });",
    "const main = Effect.gen(function* () { return 1; }).pipe(Effect.provide(layer));",
  ]) {
    it(`It allows application assembly or contextual injection: ${source}`, () => {
      const result = lintSourceWithRule("no-inline-runtime-provide", imports + source);
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
