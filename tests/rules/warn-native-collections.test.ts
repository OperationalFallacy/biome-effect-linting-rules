import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const ruleName = "warn-native-collections";
const fixtures = fixtureRoot(ruleName);

describe(ruleName, () => {
  it.each([
    ["invalid-domain-keys.ts", 2],
    ["invalid-composite-key.ts", 2],
    ["invalid-tuple-index.ts", 1],
    ["invalid-qualified-collections.ts", 2],
    ["invalid-submodule-key.ts", 1],
  ])(
    "It catches native collections with Effect value keys in %s",
    (fixture, count) => {
      const result = lintWithRule(ruleName, path.join(fixtures, fixture));
      expect(result.status).toBe(0);
      const warnings = result.diagnostics;
      expect(warnings).toHaveLength(count);
      expect(
        warnings.every(
          (entry) => entry.category === "plugin" && entry.severity === "warning",
        ),
      ).toBe(true);
      expect(
        warnings.every((entry) =>
          entry.location.path.endsWith(fixture),
        ),
      ).toBe(true);
    },
  );

  it.each([
    "valid-effect-collections.ts",
    "valid-effect-value-keys.ts",
    "valid-shadowed-constructor.ts",
    "valid-shadowed-data.ts",
    "valid-scalar-factory.ts",
    "valid-native-outside-effect.ts",
    "valid-other-constructors.ts",
    "valid-unrelated-import.ts",
    "valid-string-index.ts",
    "valid-scalar-keys.ts",
    "valid-reference-keys.ts",
    "valid-untyped-collection.ts",
    "valid-bare-constructors.ts",
  ])(
    "It allows collections without proven Effect value keys in %s",
    (fixture) => {
      const result = lintWithRule(ruleName, path.join(fixtures, fixture));

      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    },
  );
});
