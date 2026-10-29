#!/usr/bin/env node

import { Cause, Console, Effect, Layer } from "effect";

import {
  NodeChildProcessSpawner,
  NodeFileSystem,
  NodePath,
  NodeRuntime,
  NodeStdio,
  NodeTerminal,
} from "@effect/platform-node-shared";
import { Command } from "effect/cli";

import metadata from "../package.json" with { type: "json" };
import { command, ProjectChecks } from "../src/cli.ts";

Command.run(command, { version: metadata.version }).pipe(
  Effect.provide(
    Layer.mergeAll(
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
