import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports = 'import { Effect, Option } from "effect";\n';

for (const [rule, calls] of [
  ["no-effect-as", ["Effect.as(1)", "Effect.as(task, 1)", "Effect.as<number>(1)"]],
  ["no-option-as", ["Option.as(1)", "Option.as(option, 1)", "Option.as<number>(1)"]],
  ["no-effect-bind", ["Effect.bind('count', read)", "Effect.bind(task, 'count', read)"]],
] as const) {
  describe(rule, () => {
    for (const call of calls) {
      it(`It catches the prohibited combinator in ${call}`, () => {
        const result = lintSourceWithRule(rule, imports + `const value = ${call};`);
        expect(result.status).toBe(1);
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0]).toMatchObject({
          category: "plugin",
          severity: "error",
          location: { start: { line: 2 } },
        });
      });
    }
  });
}
