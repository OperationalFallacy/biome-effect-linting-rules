import { describe, expect, it } from "vitest";
import { lintSourceWithRule } from "./ruleTestHarness";

describe("Effect import scope", () => {
  for (const source of [
    'import { Effect } from "effect";',
    "import { Effect } from 'effect';",
    'import * as Effect from "effect/Effect";',
    "import * as Effect from 'effect/Effect';",
    'import { Atom } from "effect/reactivity";',
    'import { useAtomValue } from "@effect/atom-react";',
  ]) {
    it(`It catches legacy Effect.async with ${source}`, () => {
      const result = lintSourceWithRule(
        "no-effect-async",
        source + "\nconst task = Effect.async(register);",
      );
      expect(result.status).toBe(1);
      expect(result.diagnostics).toHaveLength(1);
      expect(result.diagnostics[0]).toMatchObject({
        severity: "error",
        category: "plugin",
        location: { start: { line: 2 } },
      });
    });
  }

  for (const source of [
    'const packageName = "effect";',
    'import { Effect } from "another-library";',
    'import { Effect } from "effectful";',
  ]) {
    it(`It allows unrelated code outside the Effect import scope: ${source}`, () => {
      const result = lintSourceWithRule(
        "no-effect-async",
        source + "\nconst task = Effect.async(register);",
      );
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
