import { Buffer } from "node:buffer";

import {
  Array as Arr,
  ByteSize,
  Console,
  Context,
  Effect,
  FileSystem,
  HashSet,
  Layer,
  Match,
  Option,
  Path,
  Schema,
  String as Str,
  Stream,
} from "effect";

import { Argument, Command, Flag } from "effect/cli";

import { Biome, type BiomeDiagnostic } from "./biome.ts";

/** Each preset lists rule files within the package. */
const Preset = Schema.fromJsonString(
  Schema.Struct({ plugins: Schema.Array(Schema.String) }),
);
const PluginPath = Schema.TemplateLiteralParser([
  "./node_modules/@catenarycloud/linteffect/",
  Schema.NonEmptyString,
]);
const PresetName = Schema.Literals(["core", "web", "ts-type", "full"]);
type PresetName = typeof PresetName.Type;

/** A completed check fails the command after its diagnostics have been printed. */
class CheckFailed extends Schema.TaggedError<CheckFailed>()("CheckFailed", {
  message: Schema.String,
}) {}

/** File size validation prevents the engine from silently skipping a target. */
class FileTooLarge extends Schema.TaggedError<FileTooLarge>()(
  "FileTooLarge",
  {},
) {}

/** Renders SDK byte spans as one-based Unicode positions for terminal output. */
const formatDiagnostic = (
  diagnostic: BiomeDiagnostic,
  source: string,
  file: string,
) => {
  const position = Option.fromNullishOr(diagnostic.location.span).pipe(
    Option.map(([start]) => {
      const lines = Buffer.from(source)
        .subarray(0, start)
        .toString("utf8")
        .split("\n");
      return `:${lines.length}:${Arr.fromIterable(lines.at(-1) ?? "").length + 1}`;
    }),
    Option.getOrElse(() => ""),
  );
  const severity = Match.value(diagnostic.severity).pipe(
    Match.when("information", () => "info"),
    Match.orElse((severity) => severity),
  );
  return `${file}${position} ${severity} ${diagnostic.category ?? ""}\n  ${diagnostic.description}`;
};

/** ProjectChecks loads package presets and reports diagnostics for requested files. */
export class ProjectChecks extends Context.Service<ProjectChecks>()(
  "@catenarycloud/linteffect/cli/ProjectChecks",
  {
    make: Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const biome = yield* Biome;
      const packageRoot = yield* path.fromFileUrl(
        new URL("../", import.meta.url),
      );

      /** Loads the selected preset's production plugins. */
      const loadPreset = Effect.fn("ProjectChecks.loadPreset")(function* (
        preset: PresetName,
      ) {
        const configuration = yield* fs
          .readFileString(path.join(packageRoot, "configs", `${preset}.jsonc`))
          .pipe(Effect.flatMap(Schema.decodeUnknownEffect(Preset)));
        return yield* Effect.forEach(
          configuration.plugins,
          Effect.fn(function* (plugin) {
            const [, relative] =
              yield* Schema.decodeUnknownEffect(PluginPath)(plugin);
            const content = yield* fs.readFileString(
              path.join(packageRoot, relative),
            );
            return { path: `/project/${relative}`, content };
          }),
        );
      });

      /** Prints the packaged consumer guide, or its host path. */
      const guide = Effect.fn("ProjectChecks.guide")(function* (
        print: boolean,
      ) {
        const file = path.join(packageRoot, "docs", "linting.md");
        yield* Match.value(print).pipe(
          Match.when(true, () => fs.readFileString(file)),
          Match.orElse(() => Effect.succeed(file)),
          Effect.flatMap(Console.log),
        );
      });

      /** Inspects one path without following directory links or dependency trees. */
      const inspectFile = Effect.fn("ProjectChecks.inspectFile")(function* (
        file: string,
      ) {
        const entry = yield* fs.lstat(file);
        const info = yield* Match.value(entry.type).pipe(
          Match.when("SymbolicLink", () => fs.stat(file)),
          Match.orElse(() => Effect.succeed(entry)),
        );
        const children = yield* fs
          .readDirectory(file)
          .pipe(
            Effect.map(Arr.sort(Str.Order)),
            Effect.when(
              Effect.succeed(
                info.type === "Directory" &&
                  entry.type !== "SymbolicLink" &&
                  !Arr.contains(
                    [".git", ".hg", ".svn", "node_modules"],
                    path.basename(file),
                  ),
              ),
            ),
            Effect.map(Option.getOrElse(() => Arr.empty<string>())),
            Effect.map(Arr.map((child) => path.join(file, child))),
          );
        const supported = Option.some({ file, size: info.size }).pipe(
          Option.filter(
            () =>
              info.type === "File" &&
              Arr.contains(
                [
                  ".ts",
                  ".tsx",
                  ".js",
                  ".jsx",
                  ".mjs",
                  ".cjs",
                  ".mts",
                  ".cts",
                  ".json",
                  ".jsonc",
                  ".css",
                  ".vue",
                  ".svelte",
                  ".html",
                  ".astro",
                ],
                path.extname(file),
              ),
          ),
        );
        return { children, file: supported };
      });

      /** Traverses paths in breadth-first order and checks each path once. */
      const discoverFiles = Effect.fn("ProjectChecks.discoverFiles")(
        (targets: ReadonlyArray<string>) =>
          Stream.unfold(
            {
              pending: Arr.map(targets, (target) => path.resolve(target)),
              visited: HashSet.empty<string>(),
            },
            ({ pending, visited }) =>
              Option.match(Arr.head(pending), {
                onNone: () => Effect.succeed(undefined),
                onSome: (file) =>
                  inspectFile(file).pipe(
                    Effect.when(Effect.succeed(!HashSet.has(visited, file))),
                    Effect.map(
                      (inspection) =>
                        [
                          Option.flatMap(inspection, (entry) => entry.file),
                          {
                            pending: Arr.appendAll(
                              Arr.drop(pending, 1),
                              Option.match(inspection, {
                                onNone: () => Arr.empty<string>(),
                                onSome: (entry) => entry.children,
                              }),
                            ),
                            visited: HashSet.add(visited, file),
                          },
                        ] as const,
                    ),
                  ),
              }),
          ).pipe(
            Stream.filter(Option.isSome),
            Stream.map((entry) => entry.value),
            Stream.runCollect,
          ),
      );

      /** Prints file diagnostics and returns the counts used by the command summary. */
      const checkFile = Effect.fn("ProjectChecks.checkFile")(
        (
          file: { readonly file: string; readonly size: ByteSize.ByteSize },
          plugins: ReadonlyArray<{
            readonly path: string;
            readonly content: string;
          }>,
        ) =>
          Effect.succeed(file).pipe(
            Effect.filterOrFail(
              (entry) => ByteSize.toBigInt(entry.size) <= 1048576n,
              () => new FileTooLarge(),
            ),
            Effect.flatMap(
              Effect.fnUntraced(function* (entry) {
                const root = path.resolve();
                const relative = path.relative(root, entry.file);
                const source = yield* fs.readFileString(entry.file);
                const result = yield* biome.lint({
                  root,
                  file: entry.file,
                  source,
                  plugins,
                  configuration: {
                    linter: { rules: { preset: "none" } },
                    assist: { enabled: false },
                  },
                });
                yield* Effect.forEach(
                  result.diagnostics,
                  (diagnostic) =>
                    Console.error(
                      formatDiagnostic(diagnostic, source, relative),
                    ),
                  { discard: true },
                );
                return {
                  checked: 1,
                  diagnostics: result.diagnostics.length,
                  errors: result.errors + result.parseErrors,
                };
              }),
            ),
            Effect.catchTag("FileTooLarge", () =>
              Console.error(
                `${path.relative(path.resolve(), file.file)} error File exceeds Biome's maximum file size.`,
              ).pipe(
                Effect.map(() => ({ checked: 0, diagnostics: 1, errors: 1 })),
              ),
            ),
          ),
      );

      /** Checks the requested targets and prints the summary and optional consumer guide. */
      const check = Effect.fn("ProjectChecks.check")(function* (request: {
        readonly targets: ReadonlyArray<string>;
        readonly preset: PresetName;
        readonly guide: boolean;
        readonly guideOnLinting: boolean;
      }) {
        const plugins = yield* loadPreset(request.preset);
        const files = yield* discoverFiles(request.targets);

        yield* guide(true).pipe(Effect.when(Effect.succeed(request.guide)));

        const { checked, diagnostics, errors } = yield* Effect.reduce(
          files,
          () => ({ checked: 0, diagnostics: 0, errors: 0 }),
          Effect.fn("ProjectChecks.accumulate")(function* (total, file) {
            const result = yield* checkFile(file, plugins);
            return {
              checked: total.checked + result.checked,
              diagnostics: total.diagnostics + result.diagnostics,
              errors: total.errors + result.errors,
            };
          }),
        );

        yield* Effect.fail(
          new CheckFailed({
            message: "No supported files were found in the requested targets.",
          }),
        ).pipe(Effect.when(Effect.succeed(checked === 0 && diagnostics === 0)));
        const fileWord = Match.value(checked).pipe(
          Match.when(1, () => "file"),
          Match.orElse(() => "files"),
        );
        const diagnosticWord = Match.value(diagnostics).pipe(
          Match.when(1, () => "diagnostic"),
          Match.orElse(() => "diagnostics"),
        );
        yield* Console.log(
          `Checked ${checked} ${fileWord}. Found ${diagnostics} ${diagnosticWord}.`,
        );
        yield* guide(true).pipe(
          Effect.when(
            Effect.succeed(
              request.guideOnLinting && !request.guide && diagnostics > 0,
            ),
          ),
        );
        return errors;
      });

      return { check, checkFile, discoverFiles, guide, loadPreset };
    }),
  },
) {
  static readonly layer = Layer.effect(ProjectChecks, ProjectChecks.make).pipe(
    Layer.provide(Biome.layer),
  );
}

/** Effect CLI parses arguments and dispatches the check and guide commands. */
export const command = Command.make("linteffect").pipe(
  Command.withSubcommands([
    Command.make(
      "check",
      {
        targets: Argument.String("paths").pipe(Argument.variadic({ min: 1 })),
        preset: Flag.Literals("preset", PresetName.literals).pipe(
          Flag.withDefault("full"),
        ),
        guide: Flag.Boolean("guide").pipe(Flag.withDefault(false)),
        guideOnLinting: Flag.Boolean("guide-on-linting").pipe(
          Flag.withDefault(false),
        ),
      },
      Effect.fn("check")(function* (request) {
        const checks = yield* ProjectChecks;
        const errors = yield* checks.check(request);
        yield* Effect.fail(
          new CheckFailed({ message: "Lint errors were found." }),
        ).pipe(Effect.when(Effect.succeed(errors > 0)));
      }),
    ),
    Command.make(
      "guide",
      { print: Flag.Boolean("print").pipe(Flag.withDefault(false)) },
      (request) => ProjectChecks.use((checks) => checks.guide(request.print)),
    ),
  ]),
);
