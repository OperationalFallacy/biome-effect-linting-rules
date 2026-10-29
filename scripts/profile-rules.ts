import {
  Array as Arr,
  Cause,
  Console,
  Duration,
  Effect,
  FileSystem,
  Layer,
  Match,
  Path,
} from "effect";

import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
  NodeRuntime,
  NodeStdio,
  NodeTerminal,
} from "@effect/platform-node-shared";
import { Argument, Command, Flag } from "effect/cli";

import metadata from "../package.json" with { type: "json" };
import { Biome } from "../src/biome.ts";
import { ProjectChecks } from "../src/cli.ts";

/** Measures rule execution over the requested files with the CLI's preset loader. */
const command = Command.make(
  "profile-rules",
  {
    preset: Flag.Literals("preset", ["core", "web", "ts-type", "full"]).pipe(
      Flag.withDefault("full"),
    ),
    rules: Flag.String("rule").pipe(Flag.atLeast(0)),
    except: Flag.String("except").pipe(Flag.atLeast(0)),
    each: Flag.Boolean("each").pipe(Flag.withDefault(false)),
    targets: Argument.String("paths").pipe(Argument.variadic({ min: 1 })),
  },
  Effect.fn("profileRules")(function* (request) {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const checks = yield* ProjectChecks;
    const biome = yield* Biome;
    const plugins = yield* checks.loadPreset(request.preset);
    const files = yield* checks.discoverFiles(request.targets);
    const selected = Arr.filter(plugins, (plugin) => {
      const name = path.basename(plugin.path, ".grit");
      return (
        (request.rules.length === 0 || Arr.contains(request.rules, name)) &&
        !Arr.contains(request.except, name)
      );
    });

    if (selected.length === 0) {
      return yield* Effect.fail(new Error("No matching rules selected."));
    }
    if (files.length === 0) {
      return yield* Effect.fail(new Error("No supported files found."));
    }

    /** Reports elapsed analysis time and lint status for one selection of plugins. */
    const profile = Effect.fn("profile")(function* (
      label: string,
      plugins: typeof selected,
    ) {
      const [duration, results] = yield* Effect.forEach(
        files,
        Effect.fn(function* ({ file }) {
          const source = yield* fs.readFileString(file);
          return yield* biome.lint({
            root: path.resolve(),
            file,
            source,
            plugins,
            configuration: {
              linter: { rules: { preset: "none" } },
              assist: { enabled: false },
            },
          });
        }),
      ).pipe(Effect.timed);
      const errors = Arr.reduce(
        results,
        0,
        (total, result) => total + result.errors + result.parseErrors,
      );
      const status = Match.value(errors).pipe(
        Match.when(0, () => 0),
        Match.orElse(() => 1),
      );
      yield* Console.log(
        `${label}\t${status}\t${Math.round(Duration.toMillis(duration))}`,
      );
    });

    yield* Console.log("rule\tstatus\telapsed_ms");
    if (request.each) {
      yield* Effect.forEach(selected, (plugin) =>
        profile(path.basename(plugin.path, ".grit"), [plugin]),
      );
      return;
    }

    yield* profile(
      Arr.map(selected, (plugin) => path.basename(plugin.path, ".grit")).join(
        ",",
      ),
      selected,
    );
  }),
);

Command.run(command, { version: metadata.version }).pipe(
  Effect.provide(
    Layer.mergeAll(
      Biome.layer,
      ProjectChecks.layer,
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
