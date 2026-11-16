import { Context, Effect, Layer, Schema } from "effect";

/** Names use letters and digits separated by hyphens. Rule names preserve capitals. */
const DirectoryName = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/i),
);

/** Fixtures follow <group>/<rule>/<filename>. */
const TestPath = Schema.Tuple([
  Schema.Literals(["core", "web", "ts-type", "full"]),
  DirectoryName,
  Schema.NonEmptyString,
]);

/** Filenames contain a case name followed by .ts or .tsx. */
const FixtureFilename = Schema.Tuple([
  Schema.Literals(["valid", "invalid"]),
  Schema.Literals(["ts", "tsx"]),
]);

/**
 * FixtureParser extracts the rule and expected outcome from a fixture's path.
 * Discovery uses the result to identify the case; the runner checks its outcome.
 */
export class FixtureParser extends Context.Service<FixtureParser>()(
  "@catenarycloud/linteffect/tests/support/fixtureParser",
  {
    make: Effect.sync(() => {
      /**
       * Accepts a path relative to tests/specs/ with forward slashes as separators.
       * Returns named metadata fields or fails with SchemaError. Preset registration
       * checks belong to FixtureRepository.
       */
      const parseTestPath = Effect.fn("FixtureParser.parseTestPath")(function* (
        relativePath: string,
      ) {
        const [group, rule, filename] = yield* Schema.decodeUnknownEffect(
          TestPath,
        )(relativePath.split("/"));

        const [expectation] = yield* Schema.decodeUnknownEffect(
          FixtureFilename,
        )(filename.split("."));

        return {
          group,
          rule,
          expectation,
          filename,
          relativePath,
        };
      });

      return { parseTestPath };
    }),
  },
) {
  /** Tests and repository layers obtain the parser through this layer. */
  static readonly layer = Layer.effect(FixtureParser, FixtureParser.make);
}
