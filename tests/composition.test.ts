import {
  Array as Arr,
  Effect,
  FileSystem,
  Layer,
  ManagedRuntime,
  Path,
} from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { NodeFileSystem, NodePath } from "@effect/platform-node-shared";

import { Biome } from "../src/biome";
import { ProjectChecks } from "../src/cli";

const runtime = ManagedRuntime.make(
  Layer.mergeAll(Biome.layer, ProjectChecks.layer).pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

const cases = await runtime.runPromise(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const directory = yield* path.fromFileUrl(
      new URL("./composition/", import.meta.url),
    );
    return yield* fs
      .readDirectory(directory)
      .pipe(Effect.map(Arr.filter((file) => path.extname(file) === ".ts")));
  }),
);

describe("Full preset composition", () => {
  it.each(cases)("It allows %s with every full-preset rule enabled", (file) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const checks = yield* ProjectChecks;
        const biome = yield* Biome;
        const sourceFile = yield* path.fromFileUrl(
          new URL(`./composition/${file}`, import.meta.url),
        );
        const source = yield* fs.readFileString(sourceFile);
        const plugins = yield* checks.loadPreset("full");
        const result = yield* biome.lint({
          root: "/project",
          file: `/project/${file}`,
          source,
          plugins,
          configuration: {
            linter: { rules: { preset: "none" } },
            assist: { enabled: false },
          },
        });
        expect(result.diagnostics).toEqual([]);
      }),
    ),
  );
});
