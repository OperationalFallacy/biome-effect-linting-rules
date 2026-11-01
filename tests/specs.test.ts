import {
  Array as Arr,
  Effect,
  Layer,
  ManagedRuntime,
  Path,
  Schema,
} from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { NodeFileSystem, NodePath } from "@effect/platform-node-shared";

import { FixtureRepository } from "./support/fixtureRepository";
import { FixtureRunner } from "./support/fixtureRunner";

// Discovery and execution share one service graph; each run owns its WASM scope.
const runtime = ManagedRuntime.make(
  Layer.mergeAll(FixtureRepository.layer, FixtureRunner.layer).pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

/** Snapshots retain source and the complete SDK result, like Biome's analyzer snapshots. */
const Snapshot = Schema.fromJsonString(
  Schema.Struct({ input: Schema.String, result: Schema.Unknown }),
  { space: 2 },
);

const fixtures = await runtime.runPromise(
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const repository = yield* FixtureRepository;
    const directory = yield* path.fromFileUrl(
      new URL("./specs/", import.meta.url),
    );
    return yield* repository.discoverFixtures(directory);
  }),
);

const labels = { valid: "It allows", invalid: "It catches" };

describe("Grit rule fixtures", () => {
  it.each(
    Arr.map(fixtures, (fixture) => ({
      ...fixture,
      title: `${labels[fixture.expectation]} ${fixture.relativePath}`,
    })),
  )("$title", (fixture) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const runner = yield* FixtureRunner;
        const { source, result } = yield* runner.runFixture(fixture);

        const snapshot = yield* Schema.encodeEffect(Snapshot)({
          input: source,
          result,
        });
        yield* Effect.tryPromise(() =>
          expect(`${snapshot}\n`).toMatchFileSnapshot(fixture.snapshot),
        );
      }),
    ),
  );
});
