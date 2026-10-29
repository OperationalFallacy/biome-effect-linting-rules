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
} from "effect";

import { Argument, Command, Flag } from "effect/cli";

import { Biome, type BiomeDiagnostic } from "./biome.ts";

/** Presets name packaged configurations, and plugin entries identify package-relative files. */
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

/** ProjectChecks loads packaged rules and checks file targets without changing source files. */
export class ProjectChecks extends Context.Service<ProjectChecks>()(
  "linteffect/ProjectChecks",
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
        if (print) {
          yield* fs.readFileString(file).pipe(Effect.flatMap(Console.log));
        } else {
          yield* Console.log(file);
        }
      });

      /** Finds supported files once, without descending into dependencies or directory links. */
      const discoverFiles = Effect.fn("ProjectChecks.discoverFiles")(function* (
        targets: ReadonlyArray<string>,
      ) {
        let pending = Arr.map(targets, (target) => path.resolve(target));
        let visited = HashSet.empty<string>();
        let files = Arr.empty<{
          readonly file: string;
          readonly size: ByteSize.ByteSize;
        }>();

        while (pending.length > 0) {
          const [file, ...remaining] = pending;
          pending = remaining;
          if (HashSet.has(visited, file)) {
            continue;
          }
          visited = HashSet.add(visited, file);
          let info = yield* fs.lstat(file);
          if (info.type === "SymbolicLink") {
            info = yield* fs.stat(file);
            if (info.type === "Directory") {
              continue;
            }
          }
          if (info.type === "Directory") {
            if (
              Arr.contains(
                [".git", ".hg", ".svn", "node_modules"],
                path.basename(file),
              )
            ) {
              continue;
            }
            const children = yield* fs
              .readDirectory(file)
              .pipe(Effect.map(Arr.sort(Str.Order)));
            pending = Arr.appendAll(
              pending,
              Arr.map(children, (child) => path.join(file, child)),
            );
            continue;
          }
          if (
            info.type !== "File" ||
            !Arr.contains(
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
            )
          ) {
            continue;
          }
          files = Arr.append(files, { file, size: info.size });
        }

        return files;
      });

      /** Prints file diagnostics and returns the counts used by the command summary. */
      const checkFile = Effect.fn("ProjectChecks.checkFile")(function* (
        file: { readonly file: string; readonly size: ByteSize.ByteSize },
        plugins: ReadonlyArray<{
          readonly path: string;
          readonly content: string;
        }>,
      ) {
        const root = path.resolve();
        const relative = path.relative(root, file.file);
        if (ByteSize.toBigInt(file.size) > 1048576n) {
          yield* Console.error(
            `${relative} error File exceeds Biome's maximum file size.`,
          );
          return { checked: 0, diagnostics: 1, errors: 1 };
        }

        const source = yield* fs.readFileString(file.file);
        const result = yield* biome.lint({
          root,
          file: file.file,
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
            Console.error(formatDiagnostic(diagnostic, source, relative)),
          { discard: true },
        );
        return {
          checked: 1,
          diagnostics: result.diagnostics.length,
          errors: result.errors + result.parseErrors,
        };
      });

      /** Checks the requested targets and prints the summary and optional consumer guide. */
      const check = Effect.fn("ProjectChecks.check")(function* (request: {
        readonly targets: ReadonlyArray<string>;
        readonly preset: PresetName;
        readonly guide: boolean;
        readonly guideOnLinting: boolean;
      }) {
        const plugins = yield* loadPreset(request.preset);
        const files = yield* discoverFiles(request.targets);

        if (request.guide) {
          yield* guide(true);
        }

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

        if (checked === 0 && diagnostics === 0) {
          return yield* new CheckFailed({
            message: "No supported files were found in the requested targets.",
          });
        }
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
        if (request.guideOnLinting && !request.guide && diagnostics > 0) {
          yield* guide(true);
        }
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

/** Effect CLI owns argument parsing, validation, help, and command dispatch. */
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
        if (errors > 0) {
          return yield* new CheckFailed({ message: "Lint errors were found." });
        }
      }),
    ),
    Command.make(
      "guide",
      { print: Flag.Boolean("print").pipe(Flag.withDefault(false)) },
      (request) => ProjectChecks.use((checks) => checks.guide(request.print)),
    ),
  ]),
);
