import { Context, Effect, Layer, Schema } from "effect";

/** Names use letters and digits separated by hyphens. Rule names preserve capitals. */
const DirectoryName = Schema.String.check(
  Schema.isPattern(/^[a-z0-9]+(-[a-z0-9]+)*$/i),
);

/**
 * Fixtures follow <group>/<rule>/<scenario directories>/<filename>.
 * Scenario directories use lowercase names and can span several levels.
 */
const TestPath = Schema.Struct({
  group: Schema.Literals(["core", "web", "ts-type", "full"]),
  rule: DirectoryName,
  scenario: Schema.NonEmptyArray(DirectoryName.check(Schema.isLowercased())),
  filename: Schema.NonEmptyString,
});

/** Filenames contain a case name followed by .ts or .tsx. */
const FixtureFilename = Schema.Tuple([
  Schema.NonEmptyString,
  Schema.Literals(["ts", "tsx"]),
]);

/** Case names declare valid or invalid, with variants such as valid-no-imports. */
const FixtureName = Schema.TupleWithRest(
  Schema.Tuple([Schema.Literals(["valid", "invalid"])]),
  [DirectoryName.check(Schema.isLowercased())],
);

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
        const directories = relativePath.split("/");

        const path = yield* Schema.decodeUnknownEffect(TestPath)({
          group: directories[0],
          rule: directories[1],
          scenario: directories.slice(2, -1),
          filename: directories.at(-1),
        });

        const [name] = yield* Schema.decodeUnknownEffect(FixtureFilename)(
          path.filename.split("."),
        );

        const [expectation] = yield* Schema.decodeUnknownEffect(FixtureName)(
          name.split("-"),
        );

        return {
          group: path.group,
          rule: path.rule,
          scenario: path.scenario.join("/"),
          expectation,
          filename: path.filename,
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
