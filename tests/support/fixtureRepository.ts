import {
  Array as Arr,
  Context,
  Effect,
  FileSystem,
  Layer,
  Path,
  Record,
  Schema,
  String as Str,
} from "effect";

import { FixtureParser } from "./fixtureParser";

/** Discovered cases retain their parser metadata and host file locations. */
export interface Fixture
  extends Effect.Success<
    ReturnType<FixtureParser["Service"]["parseTestPath"]>
  > {
  readonly file: string;
  readonly snapshot: string;
}

/** Preset plugin paths determine which rules a fixture can select. */
const Preset = Schema.fromJsonString(
  Schema.Struct({
    plugins: Schema.Array(Schema.String),
  }),
);

/** Discovery requires at least one source file. */
const FixtureFiles = Schema.NonEmptyArray(Schema.String);

/**
 * FixtureRepository supplies fixture files and production rules to lint tests.
 * Discovery checks preset registration; loading reads the selected source and rule.
 */
export class FixtureRepository extends Context.Service<FixtureRepository>()(
  "@catenarycloud/linteffect/tests/support/fixtureRepository",
  {
    make: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const parser = yield* FixtureParser;
      const packageRoot = yield* path.fromFileUrl(
        new URL("../../", import.meta.url),
      );

      /**
       * Returns source cases in path order with absolute file and snapshot paths.
       * Empty corpora, malformed paths, and unregistered rules fail validation.
       */
      const discoverFixtures = Effect.fn("FixtureRepository.discoverFixtures")(
        function* (directory: string) {
          const entries = yield* fs.readDirectory(directory, {
            recursive: true,
          });

          const sourceFiles = yield* Effect.filter(
            Arr.filter(entries, (entry) =>
              Arr.contains([".ts", ".tsx"], path.extname(entry)),
            ),
            (entry) =>
              fs
                .lstat(path.join(directory, entry))
                .pipe(Effect.map((info) => info.type === "File")),
          ).pipe(Effect.flatMap(Schema.decodeUnknownEffect(FixtureFiles)));

          const fixtures = yield* Effect.forEach(
            Arr.sort(sourceFiles, Str.Order),
            (entry) => parser.parseTestPath(entry.split(path.sep).join("/")),
          );

          const presets = yield* Effect.forEach(
            Arr.dedupe(Arr.map(fixtures, (fixture) => fixture.group)),
            (group) =>
              fs
                .readFileString(
                  path.join(packageRoot, "configs", `${group}.jsonc`),
                )
                .pipe(
                  Effect.flatMap(Schema.decodeUnknownEffect(Preset)),
                  Effect.map((preset) => [group, preset.plugins] as const),
                ),
          ).pipe(Effect.map(Record.fromEntries));

          yield* Effect.forEach(fixtures, (fixture) =>
            Schema.decodeUnknownEffect(Schema.Literals(presets[fixture.group]))(
              `./node_modules/@catenarycloud/linteffect/rules/${fixture.rule}.grit`,
            ).pipe(
              Effect.andThen(
                fs.access(
                  path.join(packageRoot, "rules", `${fixture.rule}.grit`),
                ),
              ),
            ),
          );

          return Arr.map(fixtures, (fixture) => ({
            ...fixture,
            file: path.resolve(directory, fixture.relativePath),
            snapshot: path.resolve(directory, `${fixture.relativePath}.snap`),
          }));
        },
      );

      /** Reads a discovered case and its production Grit rule as source text. */
      const loadFixture = Effect.fn("FixtureRepository.loadFixture")(function* (
        fixture: Fixture,
      ) {
        const { source, rule } = yield* Effect.all({
          source: fs.readFileString(fixture.file),
          rule: fs.readFileString(
            path.join(packageRoot, "rules", `${fixture.rule}.grit`),
          ),
        });

        return { fixture, source, rule };
      });

      return { discoverFixtures, loadFixture };
    }),
  },
) {
  /** The caller supplies FileSystem and Path; this layer supplies FixtureParser. */
  static readonly layer = Layer.effect(
    FixtureRepository,
    FixtureRepository.make,
  ).pipe(Layer.provide(FixtureParser.layer));
}
