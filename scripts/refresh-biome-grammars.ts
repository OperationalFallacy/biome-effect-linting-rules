import { Cause, Console, Effect, FileSystem, Layer, Path } from "effect";

import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
  NodeRuntime,
  NodeStdio,
  NodeTerminal,
} from "@effect/platform-node-shared";
import { Command, Flag } from "effect/cli";
import { FetchHttpClient, HttpClient } from "effect/http";

import metadata from "../package.json" with { type: "json" };

/** Downloads both grammar references from the selected Biome revision. */
const command = Command.make(
  "refresh-biome-grammars",
  { ref: Flag.String("ref").pipe(Flag.withDefault("main")) },
  Effect.fn("refreshGrammars")(function* ({ ref }) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const client = (yield* HttpClient.HttpClient).pipe(
      HttpClient.filterStatusOk,
    );
    const directory = yield* path.fromFileUrl(
      new URL("../rules/", import.meta.url),
    );

    yield* fs.makeDirectory(directory, { recursive: true });
    yield* Effect.forEach(
      ["js.ungram", "gritql.ungram"],
      Effect.fn(function* (filename) {
        const response = yield* client.get(
          `https://raw.githubusercontent.com/biomejs/biome/${ref}/xtask/codegen/${filename}`,
        );
        const source = yield* response.text;
        yield* fs.writeFileString(path.join(directory, filename), source);
      }),
      { discard: true },
    );
    yield* Console.log(`Refreshed Biome grammar references from ${ref}.`);
  }),
);

Command.run(command, { version: metadata.version }).pipe(
  Effect.provide(
    Layer.mergeAll(
      FetchHttpClient.layer,
      NodeTerminal.layer,
      NodeChildProcessSpawner.layer,
    ).pipe(
      Layer.provideMerge(
        Layer.mergeAll(NodeFileSystem.layer, NodePath.layer, NodeStdio.layer),
      ),
    ),
  ),
  Effect.tapCause((cause) => Console.error(Cause.pretty(cause))),
  NodeRuntime.runMain({ disableErrorReporting: true }),
);
