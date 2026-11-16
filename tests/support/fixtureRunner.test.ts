import { Effect, FileSystem, Layer, ManagedRuntime, Path } from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { NodeFileSystem, NodePath } from "@effect/platform-node-shared";

import { FixtureRepository } from "./fixtureRepository";
import { FixtureRunner } from "./fixtureRunner";

const runtime = ManagedRuntime.make(
  Layer.mergeAll(FixtureRepository.layer, FixtureRunner.layer).pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

// Each case starts with an accepted production fixture, then adds an unrelated violation.
const violations = [
  {
    name: "a built-in warning",
    source: "\nconst unused = 0;\n",
  },
  {
    name: "another plugin's error",
    source:
      '\nexport const chooseLabel = (active: boolean) => active ? "Active" : "Idle";\n',
  },
];

describe("Fixture acceptance", () => {
  it.each(
    ["valid", "invalid"].flatMap((expectation) =>
      violations.map((violation) => ({ expectation, ...violation })),
    ),
  )("It catches $name in an otherwise accepted $expectation example", (entry) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const repository = yield* FixtureRepository;
        const runner = yield* FixtureRunner;
        const directory = yield* fs.makeTempDirectoryScoped();
        const relative = `core/no-effect-bind/${entry.expectation}.ts`;
        const original = yield* path.fromFileUrl(
          new URL(`../specs/${relative}`, import.meta.url),
        );
        const source = yield* fs.readFileString(original);
        const file = path.join(directory, relative);
        yield* fs.makeDirectory(path.dirname(file), { recursive: true });
        yield* fs.writeFileString(file, source);
        const [fixture] = yield* repository.discoverFixtures(directory);

        yield* runner.runFixture(fixture);

        yield* fs.writeFileString(file, source + entry.source);
        const result = yield* runner.runFixture(fixture).pipe(Effect.result);
        expect(result._tag).toBe("Failure");
      }).pipe(Effect.scoped),
    ),
  );
});
