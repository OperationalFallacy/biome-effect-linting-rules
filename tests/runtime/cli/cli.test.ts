import process from "node:process";

import {
  Effect,
  FileSystem,
  Layer,
  ManagedRuntime,
  Path,
  Stream,
} from "effect";
import { afterAll, describe, expect, it } from "vitest";

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

/** Runs the installed entry point so parsing and process exit behavior stay covered. */
const run = Effect.fn("run")(function* (
  args: ReadonlyArray<string>,
  cwd: string,
) {
  const path = yield* Path.Path;
  const executable = yield* path.fromFileUrl(
    new URL("../../../bin/linteffect.mjs", import.meta.url),
  );
  const child = yield* ChildProcess.make(
    process.execPath,
    [executable, ...args],
    { cwd },
  );
  return yield* Effect.all(
    {
      status: child.exitCode,
      stdout: child.stdout.pipe(Stream.decodeText(), Stream.mkString),
      stderr: child.stderr.pipe(Stream.decodeText(), Stream.mkString),
    },
    { concurrency: "unbounded" },
  );
}, Effect.scoped);

describe("Effect CLI", () => {
  it.each(["core", "web", "ts-type", "full"])(
    "It allows clean source with the %s preset and preserves project files",
    (preset) =>
      runtime.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const directory = yield* fs.makeTempDirectoryScoped();
          const fixture = yield* path.fromFileUrl(
            new URL("./valid.ts", import.meta.url),
          );
          const source = yield* fs.readFileString(fixture);
          yield* fs.writeFileString(path.join(directory, "valid.ts"), source);
          yield* fs.writeFileString(
            path.join(directory, "biome.json"),
            '{"linter":{"enabled":false}}',
          );
          const result = yield* run(
            ["check", "valid.ts", `--preset=${preset}`],
            directory,
          );
          expect(result.status, result.stderr).toBe(0);
          expect(result.stderr).toBe("");
          expect(
            yield* fs.readFileString(path.join(directory, "valid.ts")),
          ).toBe(source);
          expect(
            yield* fs.readFileString(path.join(directory, "biome.json")),
          ).toBe('{"linter":{"enabled":false}}');
        }).pipe(Effect.scoped),
      ),
  );

  it.each([
    {
      fixture: "invalid.ts",
      status: 1,
      diagnostic: "invalid.ts:2:22 error plugin",
      guide: false,
    },
    {
      fixture: "warning.ts",
      status: 0,
      diagnostic: "warning plugin",
      guide: true,
    },
  ])(
    "It catches diagnostics from $fixture with the expected exit status",
    (entry) =>
      runtime.runPromise(
        Effect.gen(function* () {
          const fs = yield* FileSystem.FileSystem;
          const path = yield* Path.Path;
          const directory = yield* fs.makeTempDirectoryScoped();
          const fixture = yield* path.fromFileUrl(
            new URL(entry.fixture, import.meta.url),
          );
          yield* fs.copyFile(fixture, path.join(directory, entry.fixture));
          const result = yield* run(
            ["check", entry.fixture, "--preset=core", "--guide-on-linting"],
            directory,
          );
          expect(result.status, result.stderr).toBe(entry.status);
          expect(result.stderr).toContain(entry.diagnostic);
          expect(result.stdout).toContain("# Fix lint diagnostics");
        }).pipe(Effect.scoped),
      ),
  );

  it("It allows recursive targets without duplicate checks or dependency files", () =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const directory = yield* fs.makeTempDirectoryScoped();
        yield* fs.makeDirectory(path.join(directory, "src", "nested"), {
          recursive: true,
        });
        yield* fs.makeDirectory(path.join(directory, "src", "node_modules"));
        yield* fs.writeFileString(
          path.join(directory, "src", "valid.ts"),
          'import "effect";',
        );
        yield* fs.writeFileString(
          path.join(directory, "src", "nested", "valid.ts"),
          'import "effect";',
        );
        yield* fs.writeFileString(
          path.join(directory, "src", "node_modules", "invalid.ts"),
          'import { Effect } from "effect"; const value = Effect.Do;',
        );
        const result = yield* run(
          ["check", "src", "src/valid.ts", "--preset=core"],
          directory,
        );
        expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toBe("Checked 2 files. Found 0 diagnostics.\n");
      }).pipe(Effect.scoped),
    ));

  it.each([
    { name: "missing targets", args: ["check", "missing.ts"] },
    {
      name: "unknown presets",
      args: ["check", "input.ts", "--preset=unknown"],
    },
    { name: "unknown flags", args: ["check", "input.ts", "--unknown"] },
  ])("It catches $name", ({ args }) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const directory = yield* fs.makeTempDirectoryScoped();
        const result = yield* run(args, directory);
        expect(result.status).not.toBe(0);
        expect(result.stderr).not.toBe("");
      }).pipe(Effect.scoped),
    ),
  );

  it.each([
    { args: ["--help"], output: "SUBCOMMANDS" },
    { args: ["guide", "--print"], output: "# Fix lint diagnostics" },
    { args: ["guide"], output: "docs/linting.md" },
  ])("It allows $args without a source target", ({ args, output }) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const directory = yield* fs.makeTempDirectoryScoped();
        const result = yield* run(args, directory);
        expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toContain(output);
      }).pipe(Effect.scoped),
    ),
  );
});
