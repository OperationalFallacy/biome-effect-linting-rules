import { MemoryFileSystem, main, Workspace } from "@biomejs/wasm-nodejs";
import { Array as Arr, Context, Effect, Layer, Schema } from "effect";

import { type Fixture, FixtureRepository } from "./fixtureRepository";

/** Setup diagnostics fail the run before the source is analyzed. */
const PluginSettings = Schema.Struct({
  diagnostics: Schema.Array(Schema.Unknown).check(Schema.isMaxLength(0)),
});

/** Analysis must include every diagnostic from parseable source. */
const CompleteAnalysis = Schema.Struct({
  parseErrors: Schema.Literal(0),
  skippedDiagnostics: Schema.Literal(0),
  categories: Schema.Array(Schema.Literal("plugin")),
});

/** Invalid cases require a diagnostic, including warnings and informational messages. */
const ExpectedDiagnostics = {
  valid: Schema.Array(Schema.Unknown).check(Schema.isMaxLength(0)),
  invalid: Schema.NonEmptyArray(Schema.Unknown),
};

/** FixtureRunner analyzes each case with its selected Grit plugin through Biome's SDK. */
export class FixtureRunner extends Context.Service<FixtureRunner>()(
  "linteffect/tests/support/fixtureRunner",
  {
    make: Effect.gen(function* () {
      const repository = yield* FixtureRepository;
      yield* Effect.try(main);

      /** Each run scopes its WASM resources and returns the SDK's original diagnostics. */
      const runFixture = Effect.fn("FixtureRunner.runFixture")(function* (
        fixture: Fixture,
      ) {
        const { source, rule } = yield* repository.loadFixture(fixture);
        const pluginPath = `/project/rules/${fixture.rule}.grit`;
        const sourcePath = `/project/${fixture.relativePath}`;

        const fileSystem = yield* Effect.try(() => new MemoryFileSystem()).pipe(
          (acquire) =>
            Effect.acquireRelease(acquire, (fileSystem) =>
              Effect.sync(fileSystem.free.bind(fileSystem)),
            ),
        );

        yield* Effect.try(() =>
          fileSystem.insert(pluginPath, new TextEncoder().encode(rule)),
        );

        const workspace = yield* Effect.try(() =>
          Workspace.withFileSystem(fileSystem),
        ).pipe((acquire) =>
          Effect.acquireRelease(acquire, (workspace) =>
            Effect.sync(workspace.free.bind(workspace)),
          ),
        );

        const { projectKey } = yield* Effect.try(() =>
          workspace.openProject({
            path: "/project",
            openUninitialized: true,
          }),
        );

        yield* Effect.try(() =>
          workspace.updateSettings({
            projectKey,
            workspaceDirectory: "/project",
            configuration: {
              plugins: [pluginPath],
              linter: { rules: { preset: "none" } },
              assist: { enabled: false },
            },
          }),
        ).pipe(Effect.flatMap(Schema.decodeUnknownEffect(PluginSettings)));

        yield* Effect.try(() =>
          workspace.openFile({
            projectKey,
            path: sourcePath,
            content: { type: "fromClient", content: source, version: 0 },
          }),
        );

        const result = yield* Effect.try(() =>
          workspace.pullDiagnostics({
            projectKey,
            path: sourcePath,
            categories: ["syntax", "lint"],
          }),
        );

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
      }, Effect.scoped);

      return { runFixture };
    }),
  },
) {
  /** The caller supplies FileSystem and Path; this layer supplies FixtureRepository. */
  static readonly layer = Layer.effect(FixtureRunner, FixtureRunner.make).pipe(
    Layer.provide(FixtureRepository.layer),
  );
}
