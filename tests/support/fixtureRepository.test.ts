import { Effect, FileSystem, Layer, ManagedRuntime, Path } from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { NodeFileSystem, NodePath } from "@effect/platform-node-shared";

import { FixtureRepository } from "./fixtureRepository";

// Cases use temporary corpora and the package's production presets and rules.
const runtime = ManagedRuntime.make(
  FixtureRepository.layer.pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

describe("FixtureRepository.discoverFixtures", () => {
  it("It allows sorted source cases alongside snapshots and documentation", () =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repository = yield* FixtureRepository;
        const directory = yield* fs.makeTempDirectoryScoped();
        yield* Effect.forEach(
          [
            "core/no-effect-bind/calls/valid.ts",
            "core/no-effect-bind/calls/invalid.ts",
            "core/no-effect-bind/calls/invalid.ts.snap",
            "core/no-effect-bind/calls/README.md",
            "web/no-react-state/hooks/valid-custom-hook.tsx",
          ],
          (file) =>
            fs
              .makeDirectory(path.dirname(path.join(directory, file)), {
                recursive: true,
              })
              .pipe(
                Effect.andThen(
                  fs.writeFileString(path.join(directory, file), ""),
                ),
              ),
        );
        yield* fs.makeDirectory(path.join(directory, "folder.ts"));

        const fixtures = yield* repository.discoverFixtures(directory);
        expect(fixtures.map((fixture) => fixture.relativePath)).toEqual([
          "core/no-effect-bind/calls/invalid.ts",
          "core/no-effect-bind/calls/valid.ts",
          "web/no-react-state/hooks/valid-custom-hook.tsx",
        ]);
        expect(fixtures[0]).toEqual({
          group: "core",
          rule: "no-effect-bind",
          scenario: "calls",
          expectation: "invalid",
          filename: "invalid.ts",
          relativePath: "core/no-effect-bind/calls/invalid.ts",
          file: path.join(directory, "core/no-effect-bind/calls/invalid.ts"),
          snapshot: path.join(
            directory,
            "core/no-effect-bind/calls/invalid.ts.snap",
          ),
        });
      }).pipe(Effect.scoped),
    ));

  it.each([
    { name: "an empty corpus", files: [] },
    {
      name: "a corpus with only snapshots",
      files: ["core/no-effect-bind/calls/invalid.ts.snap"],
    },
    {
      name: "a malformed fixture path",
      files: ["core/no-effect-bind/invalid.ts"],
    },
    {
      name: "a rule outside its selected preset",
      files: ["web/no-effect-bind/calls/invalid.ts"],
    },
  ])("It catches $name", ({ files }) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repository = yield* FixtureRepository;
        const directory = yield* fs.makeTempDirectoryScoped();
        yield* Effect.forEach(files, (file) =>
          fs
            .makeDirectory(path.dirname(path.join(directory, file)), {
              recursive: true,
            })
            .pipe(
              Effect.andThen(
                fs.writeFileString(path.join(directory, file), ""),
              ),
            ),
        );

        const result = yield* repository
          .discoverFixtures(directory)
          .pipe(Effect.result);
        expect(result).toMatchObject({
          _tag: "Failure",
          failure: { _tag: "SchemaError" },
        });
      }).pipe(Effect.scoped),
    ),
  );

  it("It allows discovery of the checked-in fixture corpus", () =>
    runtime.runPromise(
      Effect.gen(function* () {
        const path = yield* Path.Path;
        const repository = yield* FixtureRepository;
        const directory = yield* path.fromFileUrl(
          new URL("../specs/", import.meta.url),
        );
        const fixtures = yield* repository.discoverFixtures(directory);
        expect(fixtures.length).toBeGreaterThan(0);
        expect(
          fixtures.every((fixture) => path.isAbsolute(fixture.snapshot)),
        ).toBe(true);
      }),
    ));
});
