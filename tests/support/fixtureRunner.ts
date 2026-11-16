import { Array as Arr, Context, Effect, Layer, Schema } from "effect";
import { expect } from "vitest";

import { Biome, builtinLinter } from "../../src/biome";
import { ProjectChecks } from "../../src/cli";
import { type Fixture, FixtureRepository } from "./fixtureRepository";

/** Analysis must include every diagnostic from parseable source. */
const CompleteAnalysis = Schema.Struct({
  parseErrors: Schema.Literal(0),
  skippedDiagnostics: Schema.Literal(0),
  categories: Schema.Array(Schema.Literal("plugin")),
});

/** Invalid cases require diagnostics at every severity. */
const ExpectedDiagnostics = {
  valid: Schema.Array(Schema.Unknown).check(Schema.isMaxLength(0)),
  invalid: Schema.NonEmptyArray(Schema.Unknown),
};

/** FixtureRunner accepts examples only when their selected rule and combined checks agree. */
export class FixtureRunner extends Context.Service<FixtureRunner>()(
  "@catenarycloud/linteffect/tests/support/fixtureRunner",
  {
    make: Effect.gen(function* () {
      const repository = yield* FixtureRepository;
      const biome = yield* Biome;
      const checks = yield* ProjectChecks;
      const plugins = yield* checks.loadPreset("full");

      /** Checks one example in isolation and with all rules, returning its original result for snapshots. */
      const runFixture = Effect.fn("FixtureRunner.runFixture")(function* (
        fixture: Fixture,
      ) {
        const { source, rule } = yield* repository.loadFixture(fixture);

        const result = yield* biome.lint({
          root: "/project",
          file: `/project/${fixture.relativePath}`,
          source,
          plugins: [
            { path: `/project/rules/${fixture.rule}.grit`, content: rule },
          ],
          configuration: {
            linter: { rules: { preset: "none" } },
            assist: { enabled: false },
          },
        });

        const combined = yield* biome.lint({
          root: "/project",
          file: `/project/${fixture.relativePath}`,
          source,
          plugins,
          configuration: {
            linter: builtinLinter,
            assist: { enabled: false },
          },
        });

        yield* Effect.forEach([result, combined], (analysis) =>
          Schema.decodeUnknownEffect(CompleteAnalysis)({
            parseErrors: analysis.parseErrors,
            skippedDiagnostics: analysis.skippedDiagnostics,
            categories: Arr.map(
              analysis.diagnostics,
              (diagnostic) => diagnostic.category,
            ),
          }),
        );

        yield* Schema.decodeUnknownEffect(
          ExpectedDiagnostics[fixture.expectation],
        )(result.diagnostics);

        yield* Effect.try(() =>
          expect(
            combined.diagnostics,
            `${fixture.relativePath}: combined checks must report only the selected rule's diagnostics`,
          ).toEqual(result.diagnostics),
        );

        return { source, result };
      });

      return { runFixture };
    }),
  },
) {
  static readonly layer = Layer.effect(FixtureRunner, FixtureRunner.make).pipe(
    Layer.provide(
      Layer.mergeAll(FixtureRepository.layer, Biome.layer, ProjectChecks.layer),
    ),
  );
}
