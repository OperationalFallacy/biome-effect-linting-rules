import { Buffer } from "node:buffer";
import process from "node:process";

import {
  Array as Arr,
  Effect,
  FileSystem,
  Layer,
  ManagedRuntime,
  Match,
  Path,
  Schema,
  Stream,
} from "effect";
import { afterAll, describe, expect, it } from "vitest";

import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
} from "@effect/platform-node-shared";
import { ChildProcess } from "effect/process";

import { Biome } from "../../../src/biome";

const runtime = ManagedRuntime.make(
  Layer.mergeAll(Biome.layer, NodeChildProcessSpawner.layer).pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

const Json = Schema.fromJsonString(Schema.Unknown);
const Position = Schema.Struct({ line: Schema.Number, column: Schema.Number });
const NativeReport = Schema.fromJsonString(
  Schema.Struct({
    diagnostics: Schema.Array(
      Schema.Struct({
        category: Schema.String,
        severity: Schema.String,
        message: Schema.String,
        location: Schema.Struct({
          start: Schema.optionalKey(Position),
          end: Schema.optionalKey(Position),
        }),
      }),
    ),
  }),
);

const cases = [
  {
    name: "plugin errors",
    rule: "no-effect-as",
    file: "../../specs/core/no-effect-as/result-selection/invalid.ts",
  },
  {
    name: "Unicode and CRLF byte spans",
    rule: "no-effect-as",
    file: "./unicode-crlf.ts",
  },
  { name: "suppression", rule: "no-effect-as", file: "./suppressed.ts" },
  { name: "syntax errors", rule: "no-effect-as", file: "./syntax-error.ts" },
  { name: "JSX", rule: "no-effect-as", file: "./callback.tsx" },
  {
    name: "warnings",
    rule: "no-flatmap-ladder",
    file: "../../specs/core/no-flatmap-ladder/composition/invalid.ts",
  },
  {
    name: "information",
    rule: "no-return-in-arrow",
    file: "../../specs/core/no-return-in-arrow/callback-bodies/invalid.ts",
  },
];

describe("Biome SDK and native diagnostics", () => {
  it.each(cases)(
    "It allows matching messages, severity, and positions for $name",
    (entry) =>
      runtime.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const biome = yield* Biome;
          const directory = yield* fs.makeTempDirectoryScoped();
          const sourceFile = yield* path.fromFileUrl(
            new URL(entry.file, import.meta.url),
          );
          const ruleFile = yield* path.fromFileUrl(
            new URL(`../../../rules/${entry.rule}.grit`, import.meta.url),
          );
          const binary = yield* path.fromFileUrl(
            new URL(
              "../../../node_modules/@biomejs/biome/bin/biome",
              import.meta.url,
            ),
          );
          const source = yield* fs.readFileString(sourceFile);
          const content = yield* fs.readFileString(ruleFile);
          const file = path.join(directory, path.basename(sourceFile));
          const configuration = {
            linter: { rules: { preset: "none" as const } },
            assist: { enabled: false },
          };
          yield* fs.writeFileString(file, source);
          yield* Schema.encodeEffect(Json)({
            ...configuration,
            plugins: [ruleFile],
          }).pipe(
            Effect.flatMap((text) =>
              fs.writeFileString(path.join(directory, "biome.json"), text),
            ),
          );

          const child = yield* ChildProcess.make(process.execPath, [
            binary,
            "lint",
            "--reporter=json",
            "--max-diagnostics=none",
            `--config-path=${directory}`,
            file,
          ]);
          const native = yield* Effect.all(
            {
              status: child.exitCode,
              stdout: child.stdout.pipe(Stream.decodeText(), Stream.mkString),
              stderr: child.stderr.pipe(Stream.decodeText(), Stream.mkString),
            },
            { concurrency: "unbounded" },
          );
          const report = yield* Schema.decodeUnknownEffect(NativeReport)(
            native.stdout,
          );
          const actual = yield* biome.lint({
            root: directory,
            file,
            source,
            configuration,
            plugins: [{ path: ruleFile, content }],
          });

          const position = (offset: number) => {
            const lines = Buffer.from(source)
              .subarray(0, offset)
              .toString("utf8")
              .split("\n");
            return {
              line: lines.length,
              column: Arr.fromIterable(lines.at(-1) ?? "").length + 1,
            };
          };
          expect(
            Arr.map(actual.diagnostics, (diagnostic) => {
              const severity = Match.value(diagnostic.severity).pipe(
                Match.when("information", () => "info"),
                Match.orElse((severity) => severity),
              );
              return {
                category: diagnostic.category,
                severity,
                message: diagnostic.description,
                location: {
                  start: position(diagnostic.location.span?.[0] ?? 0),
                  end: position(diagnostic.location.span?.[1] ?? 0),
                },
              };
            }),
          ).toEqual(report.diagnostics);
          expect(native.status).toBe(
            Match.value(actual.errors + actual.parseErrors).pipe(
              Match.when(0, () => 0),
              Match.orElse(() => 1),
            ),
          );
        }).pipe(Effect.scoped),
      ),
  );
});
