import process from "node:process";
import { runInNewContext } from "node:vm";

import {
  Effect,
  FileSystem,
  Layer,
  ManagedRuntime,
  Path,
  Schema,
  Stream,
} from "effect";
import { afterAll, describe, expect, it, vi } from "vitest";

import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
} from "@effect/platform-node-shared";
import { ChildProcess } from "effect/process";

const runtime = ManagedRuntime.make(
  NodeChildProcessSpawner.layer.pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

const Configuration = Schema.fromJsonString(
  Schema.Struct({
    plugins: Schema.Array(Schema.String),
    linter: Schema.Unknown,
  }),
);
const PluginPath = Schema.TemplateLiteralParser([
  "./node_modules/@catenarycloud/linteffect/",
  Schema.NonEmptyString,
]);

describe("Constructor callbacks", () => {
  it.each([false, true])(
    "It allows constructor mocks after a full configured check with lint enabled %s",
    (enabled) =>
      runtime.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const root = yield* path.fromFileUrl(
            new URL("../../../", import.meta.url),
          );
          const directory = yield* fs.makeTempDirectoryScoped();
          const sourcePath = path.join(directory, "constructor.test.js");
          const configuration = yield* fs
            .readFileString(path.join(root, "configs", "full.jsonc"))
            .pipe(Effect.flatMap(Schema.decodeUnknownEffect(Configuration)));
          const plugins = yield* Effect.forEach(
            configuration.plugins,
            (plugin) =>
              Schema.decodeUnknownEffect(PluginPath)(plugin).pipe(
                Effect.map(([, relative]) => path.join(root, relative)),
              ),
          );
          yield* Schema.encodeEffect(Configuration)({
            plugins,
            linter: configuration.linter,
          }).pipe(
            Effect.flatMap((text) =>
              fs.writeFileString(path.join(directory, "biome.json"), text),
            ),
          );
          const fixture = yield* path.fromFileUrl(
            new URL("./mock.js", import.meta.url),
          );
          yield* fs.copyFile(fixture, sourcePath);

          const child = yield* ChildProcess.make(process.execPath, [
            path.join(
              root,
              "node_modules",
              "@biomejs",
              "biome",
              "bin",
              "biome",
            ),
            "check",
            "--write",
            `--linter-enabled=${enabled}`,
            `--config-path=${directory}`,
            sourcePath,
          ]);
          const result = yield* Effect.all(
            {
              status: child.exitCode,
              stdout: child.stdout.pipe(Stream.decodeText(), Stream.mkString),
              stderr: child.stderr.pipe(Stream.decodeText(), Stream.mkString),
            },
            { concurrency: "unbounded" },
          );
          expect(result.status, result.stderr).toBe(0);

          const checkedSource = yield* fs.readFileString(sourcePath);
          const context = { vi, widget: undefined };
          yield* Effect.try(() => runInNewContext(checkedSource, context));
          expect(context.widget).toEqual({ value: 1 });
        }).pipe(Effect.scoped),
      ),
  );
});
