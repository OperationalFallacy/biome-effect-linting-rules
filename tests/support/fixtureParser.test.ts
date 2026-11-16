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
      expectation: "invalid",
      filename: "invalid.ts",
      relativePath: "core/no-effect-bind/invalid.ts",
    },
    {
      group: "web",
      rule: "no-react-state",
      expectation: "valid",
      filename: "valid.tsx",
      relativePath: "web/no-react-state/valid.tsx",
    },
    {
      group: "ts-type",
      rule: "no-model-overlay-cast",
      expectation: "invalid",
      filename: "invalid.tsx",
      relativePath: "ts-type/no-model-overlay-cast/invalid.tsx",
    },
    {
      group: "full",
      rule: "no-effect-bind",
      expectation: "valid",
      filename: "valid.ts",
      relativePath: "full/no-effect-bind/valid.ts",
    },
    {
      group: "core",
      rule: "no-effect-orElse-ladder",
      expectation: "invalid",
      filename: "invalid.ts",
      relativePath: "core/no-effect-orElse-ladder/invalid.ts",
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
    "core/no-effect-bind/calls/invalid.ts",
    "core/no-effect-bind/example.ts",
    "core/no-effect-bind/invalid.js",
    "core/no-effect-bind/invalid.ts.snap",
    "core/no-effect-bind/invalid-.ts",
    "core/no-effect-bind/valid--imports.ts",
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
