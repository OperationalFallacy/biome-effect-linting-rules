import { MemoryFileSystem, main, Workspace } from "@biomejs/wasm-nodejs";
import { Array as Arr, Context, Effect, Layer, Schema } from "effect";

/** Source analysis uses caller-supplied plugins and configuration in an isolated workspace. */
export interface BiomeInput {
  readonly root: string;
  readonly file: string;
  readonly source: string;
  readonly plugins: ReadonlyArray<{
    readonly path: string;
    readonly content: string;
  }>;
  readonly configuration: Parameters<
    Workspace["updateSettings"]
  >[0]["configuration"];
}

export type BiomeDiagnostic = ReturnType<
  Workspace["pullDiagnostics"]
>["diagnostics"][number];

/** Plugin setup must succeed before source analysis starts. */
const PluginSettings = Schema.Struct({
  diagnostics: Schema.Array(Schema.Unknown).check(Schema.isMaxLength(0)),
});

/** Biome provides scoped source analysis for the CLI and fixture tests. */
export class Biome extends Context.Service<Biome>()(
  "@catenarycloud/linteffect/biome",
  {
    make: Effect.gen(function* () {
      yield* Effect.try(main);

      /** Returns the SDK result after releasing the workspace and memory filesystem. */
      const lint = Effect.fn("Biome.lint")(function* (input: BiomeInput) {
        const fileSystem = yield* Effect.try(() => new MemoryFileSystem()).pipe(
          (acquire) =>
            Effect.acquireRelease(acquire, (fileSystem) =>
              Effect.sync(fileSystem.free.bind(fileSystem)),
            ),
        );

        yield* Effect.forEach(input.plugins, (plugin) =>
          Effect.try(() =>
            fileSystem.insert(
              plugin.path.replaceAll("\\", "/"),
              new TextEncoder().encode(plugin.content),
            ),
          ),
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
            path: input.root.replaceAll("\\", "/"),
            openUninitialized: true,
          }),
        );

        yield* Effect.try(() =>
          workspace.updateSettings({
            projectKey,
            workspaceDirectory: input.root.replaceAll("\\", "/"),
            configuration: {
              ...input.configuration,
              plugins: Arr.map(input.plugins, (plugin) =>
                plugin.path.replaceAll("\\", "/"),
              ),
            },
          }),
        ).pipe(Effect.flatMap(Schema.decodeUnknownEffect(PluginSettings)));

        yield* Effect.try(() =>
          workspace.openFile({
            projectKey,
            path: input.file.replaceAll("\\", "/"),
            content: { type: "fromClient", content: input.source, version: 0 },
          }),
        );

        return yield* Effect.try(() =>
          workspace.pullDiagnostics({
            projectKey,
            path: input.file.replaceAll("\\", "/"),
            categories: ["syntax", "lint"],
          }),
        );
      }, Effect.scoped);

      return { lint };
    }),
  },
) {
  static readonly layer = Layer.effect(Biome, Biome.make);
}
