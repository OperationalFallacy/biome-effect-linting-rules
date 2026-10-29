import { Effect, ManagedRuntime } from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { FixtureParser } from "./fixtureParser";

// Cases share the production parser layer; afterAll releases its runtime scope.
const runtime = ManagedRuntime.make(FixtureParser.layer);
afterAll(() => runtime.dispose());

describe("FixtureParser.parseTestPath", () => {
  it.each([
    {
      group: "core",
      rule: "no-effect-bind",
      scenario: "call-forms",
      expectation: "invalid",
      filename: "invalid.ts",
      relativePath: "core/no-effect-bind/call-forms/invalid.ts",
    },
    {
      group: "web",
      rule: "no-react-state",
      scenario: "components/nested-hooks",
      expectation: "valid",
      filename: "valid-custom-hook.tsx",
      relativePath:
        "web/no-react-state/components/nested-hooks/valid-custom-hook.tsx",
    },
    {
      group: "ts-type",
      rule: "no-model-overlay-cast",
      scenario: "assertions",
      expectation: "invalid",
      filename: "invalid-generic.tsx",
      relativePath:
        "ts-type/no-model-overlay-cast/assertions/invalid-generic.tsx",
    },
    {
      group: "full",
      rule: "no-effect-bind",
      scenario: "import-scope",
      expectation: "valid",
      filename: "valid-no-imports.ts",
      relativePath: "full/no-effect-bind/import-scope/valid-no-imports.ts",
    },
    {
      group: "core",
      rule: "no-effect-orElse-ladder",
      scenario: "recovery",
      expectation: "invalid",
      filename: "invalid.ts",
      relativePath: "core/no-effect-orElse-ladder/recovery/invalid.ts",
    },
  ])("It allows fixture metadata for $relativePath", (expected) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const parser = yield* FixtureParser;
        const metadata = yield* parser.parseTestPath(expected.relativePath);
        expect(metadata).toEqual(expected);
      }),
    ),
  );

  it.each([
    "",
    "other/no-effect-bind/calls/invalid.ts",
    "core/no-effect-bind/invalid.ts",
    "core/no-effect-bind/calls/example.ts",
    "core/no-effect-bind/calls/invalid.js",
    "core/no-effect-bind/calls/invalid.ts.snap",
    "core/no-effect-bind/calls/invalid-.ts",
    "core/no-effect-bind/calls/valid--imports.ts",
    "/core/no-effect-bind/calls/invalid.ts",
    "../core/no-effect-bind/calls/invalid.ts",
    "core/../calls/invalid.ts",
    "core/no-effect-bind/../invalid.ts",
    "core/no-effect-bind/calls/../../invalid.ts",
    "core/no-effect-bind//invalid.ts",
    "core/no-effect-bind/calls//invalid.ts",
    "core/no-effect-bind/./invalid.ts",
  ])("It catches malformed fixture paths: %s", (relativePath) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const parser = yield* FixtureParser;
        const result = yield* parser
          .parseTestPath(relativePath)
          .pipe(Effect.result);
        expect(result).toMatchObject({
          _tag: "Failure",
          failure: { _tag: "SchemaError" },
        });
      }),
    ),
  );
});
