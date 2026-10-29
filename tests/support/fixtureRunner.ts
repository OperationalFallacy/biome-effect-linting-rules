import { Array as Arr, Context, Effect, Layer, Schema } from "effect";

import { Biome } from "../../src/biome";
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

/** FixtureRunner checks each case's expected outcome against Biome's original diagnostics. */
export class FixtureRunner extends Context.Service<FixtureRunner>()(
  "linteffect/tests/support/fixtureRunner",
  {
    make: Effect.gen(function* () {
      const repository = yield* FixtureRepository;
      const biome = yield* Biome;

      /** Loads the selected rule and verifies complete diagnostics for one case. */
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

        yield* Schema.decodeUnknownEffect(CompleteAnalysis)({
          parseErrors: result.parseErrors,
          skippedDiagnostics: result.skippedDiagnostics,
          categories: Arr.map(
            result.diagnostics,
            (diagnostic) => diagnostic.category,
          ),
        });

        yield* Schema.decodeUnknownEffect(
          ExpectedDiagnostics[fixture.expectation],
        )(result.diagnostics);

        return { source, result };
      });

      return { runFixture };
    }),
  },
) {
  static readonly layer = Layer.effect(FixtureRunner, FixtureRunner.make).pipe(
    Layer.provide(Layer.mergeAll(FixtureRepository.layer, Biome.layer)),
  );
}
