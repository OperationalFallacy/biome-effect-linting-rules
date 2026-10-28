import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

const imports =
  'import { Effect } from "effect";\nimport { Atom, AtomRegistry } from "effect/reactivity";\n';

describe("no-atom-registry-effect-sync", () => {
  for (const operation of [
    "Atom.get(counter)",
    "Atom.set(counter, 1)",
    "Atom.update(counter, (n) => n + 1)",
    "Atom.modify(counter, (n) => [n, n + 1])",
    "Atom.refresh(counter)",
  ]) {
    for (const callback of [`() => ${operation}`, `() => { return ${operation}; }`]) {
      it(`It catches an Effect.sync callback that returns ${operation}`, () => {
        const result = lintSourceWithRule(
          "no-atom-registry-effect-sync",
          imports + `const task = Effect.sync(${callback});`,
        );
        expect(result.status).toBe(1);
        expect(result.diagnostics).toHaveLength(1);
        expect(result.diagnostics[0]).toMatchObject({
          category: "plugin",
          severity: "error",
          location: { start: { line: 3 } },
        });
      });
    }
    it(`It allows ${operation} as the Effect itself`, () => {
      const result = lintSourceWithRule(
        "no-atom-registry-effect-sync",
        imports + `const task = ${operation};`,
      );
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }

  it("It allows synchronous registry instance methods inside Effect.sync", () => {
    const result = lintSourceWithRule(
      "no-atom-registry-effect-sync",
      imports +
        `
const counter = Atom.make(0);
const atomRegistry = AtomRegistry.make();
const read = Effect.sync(() => atomRegistry.get(counter));
const write = Effect.sync(() => { atomRegistry.set(counter, 1); });
`,
    );
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });

  it("It allows a callback that returns a function for later use", () => {
    const result = lintSourceWithRule(
      "no-atom-registry-effect-sync",
      imports + "const task = Effect.sync(() => () => Atom.get(counter));",
    );
    expect(result.status).toBe(0);
    expect(result.diagnostics).toEqual([]);
  });
});
