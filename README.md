# lintEffect

`lintEffect` is a Biome rule pack for Effect TypeScript. It enforces flat composition, explicit sequencing, readable control flow, and shapes that are easier to remediate mechanically.

The rules target patterns that make Effect code harder to scan and harder to rewrite safely: nested combinator towers, nested `Effect.gen`, sequencing hidden inside collection helpers, callback scaffolding, and wrapper-heavy type patterns. Diagnostics stay local to the offending call site so a human or coding agent can rewrite the exact shape without guessing repository conventions.

For rule authoring guidance, see [`docs/rule-guidance.md`](./docs/rule-guidance.md).

## Example

The animation below shows the rules applied to a file from Effect's Discord bot through Codex. The final result required steering, but the rewrite made code scans and message routing read as typed transforms and made fetch, keep, and drop behavior easier to follow.

Source file: https://github.com/Effect-TS/discord-bot/blob/main/packages/discord/src/Messages.ts

![messages refactor demo](./media/messagesRefactor.gif)

## Install

```bash
npm install -D @biomejs/biome @catenarycloud/linteffect
```

```bash
yarn add -D @biomejs/biome @catenarycloud/linteffect
```

```bash
pnpm add -D @biomejs/biome @catenarycloud/linteffect
```

If you use Yarn Berry, set `nodeLinker: node-modules`. Biome does not currently resolve Grit plugin paths from package `extends` correctly through Plug'n'Play.

The package publishes the full rule set plus three smaller presets. `core` contains the general Effect composition and control-flow rules. `web` contains the frontend and React rules. `ts-type` contains the type-modeling rules for casts, assertions, sentinel values, and wrapper-heavy shapes. The package root and `full` both export the full rule set.

This split keeps preset composition in the package. Repositories extend one published entrypoint instead of assembling rule groups manually.

## Integrate into `biome.jsonc`

Extend `@catenarycloud/linteffect` to load the complete published rule set.

```jsonc
{
  "extends": ["@catenarycloud/linteffect"]
}
```

Extend `@catenarycloud/linteffect/core` to load the rules that flatten pipelines, expose sequencing, and keep core Effect control flow readable.

```jsonc
{
  "extends": ["@catenarycloud/linteffect/core"]
}
```

Extend `@catenarycloud/linteffect/web` to load the frontend and React rules.

```jsonc
{
  "extends": ["@catenarycloud/linteffect/web"]
}
```

Extend `@catenarycloud/linteffect/ts-type` to load the type-modeling rules for casts, assertions, sentinel values, and wrapper-heavy shapes.

```jsonc
{
  "extends": ["@catenarycloud/linteffect/ts-type"]
}
```

Extend `@catenarycloud/linteffect/full` to use the explicit full-preset alias instead of the package root.

```jsonc
{
  "extends": ["@catenarycloud/linteffect/full"]
}
```

## Add repository-local rules

If the repository has local rules, layer them on top of the package preset in `biome.jsonc`.

```jsonc
{
  "extends": ["@catenarycloud/linteffect"],
  "plugins": [
    "./biome-plugins/my-project-specific-rule.grit"
  ]
}
```

## Tooling advisory

Use this rule pack with `@effect/tsgo`, `@typescript/native-preview`, and the `@effect/language-service` TypeScript language-service plugin in `tsconfig.json`.

Biome enforces code-shape constraints. Tsgo provides fast compile feedback. The Effect language service provides editor and project-mode diagnostics. Together they keep remediation loops fast enough for active development and agent-guided rewrites.

[Effect Language Service](https://github.com/Effect-TS/language-service)

In the Tradedal.com codebase, a Biome lint over the backend Effect surface processes hundreds of TypeScript files and tens of thousands of lines in about 5 seconds on a Mac Mini M2. That keeps lint feedback in the same general feedback class as project-mode `tsgo` diagnostics. Agents usually lint a smaller file set, so feedback is faster.

## How diagnostics help agents

Each rule emits one focused diagnostic at the offending call site. The message states the rejected shape, why that shape is harmful, and which Effect shape the rewrite should move toward.

That makes the remediation loop narrow. An agent can lint one file, inspect one message, rewrite one method, and rerun Biome without inferring the repository's preferred architecture from surrounding code.

These rules are opinionated. Start with a smaller preset or a few specific rules when applying them to an existing codebase. For better agent rewrites, include the lint guidance in [docs/linting.md](./docs/linting.md) in the agent's lint task.

## Examples

### Nested Effect ladder to flat pipeline

```ts
const loadUser = Effect.map(
  Effect.flatMap(getUserId, (userId) => fetchUser(userId)),
  (user) => user.profile
);
```

```ts
const loadUser = getUserId.pipe(
  Effect.flatMap((userId) => fetchUser(userId)),
  Effect.map((user) => user.profile)
);
```

The rewrite moves `getUserId` to the pipeline source, keeps the fetch step in `Effect.flatMap`, and keeps the projection in `Effect.map`. Data flow reads in execution order instead of through nested wrappers.

### Nested `Effect.gen` to one generator

```ts
const saveTrade = Effect.gen(function* () {
  const user = yield* getUser;
  return yield* Effect.gen(function* () {
    const trade = yield* createTrade(user.id);
    return yield* persistTrade(trade);
  });
});
```

```ts
const saveTrade = Effect.gen(function* () {
  const user = yield* getUser;
  const trade = yield* createTrade(user.id);
  return yield* persistTrade(trade);
});
```

The rewrite removes hidden sequencing and keeps one method responsible for one visible flow.

### Sequential side effects hidden in `Effect.all`

```ts
const refresh = Effect.all(
  [
    Ref.set(statusRef, "loading"),
    Effect.logDebug("refresh:start"),
    Reactivity.invalidate(queryKey),
  ],
  { concurrency: 1 }
).pipe(Effect.asVoid);
```

```ts
const refresh = Ref.set(statusRef, "loading").pipe(
  Effect.andThen(Effect.logDebug("refresh:start")),
  Effect.andThen(Reactivity.invalidate(queryKey))
);
```

The rewrite makes sequencing explicit instead of encoding it indirectly through an array plus `concurrency: 1`.

### Block-bodied callback to expression callback

```ts
const normalized = Option.map(value, (current) => {
  return current.trim();
});
```

```ts
const normalized = Option.map(value, (current) => current.trim());
```

The rewrite removes callback scaffolding that adds noise without changing control flow.

## Repository layout

- `biome.jsonc`: package root config entrypoint
- `configs/*.jsonc`: published presets
- `docs/linting.md`: lint remediation guidance for humans and coding agents
- `rules/*.grit`: shipped Biome Grit rules
- `examples/biome.effect.jsonc`: package usage example
- `docs/rule-guidance.md`: rule authoring guidance
- `scripts/refresh-biome-grammars.ts`: refresh step for Biome grammar references

## Usage model

Install `@catenarycloud/linteffect`, extend one published preset in `biome.jsonc`, and add repository-local overrides only where needed. That keeps upgrades, provenance, and version pinning under npm instead of local vendoring.

## Direct rule paths

Direct plugin paths also work when you want a custom subset instead of a preset.

```jsonc
{
  "plugins": [
    "./node_modules/@catenarycloud/linteffect/rules/no-effect-ladder.grit"
  ]
}
```

The package resolves to installed `node_modules/@catenarycloud/linteffect/rules/*.grit` paths because current Biome package-based `extends` resolution does not load Grit plugins relative to the package config file.

## Grammar references

The repository keeps `rules/js.ungram` and `rules/gritql.ungram` only for rule authoring and rule updates.

Refresh them with:

```bash
yarn refresh:biome-grammars --ref <biome-git-ref>
```

Use an explicit Biome tag or commit when aligning the package to a specific upstream Biome version.

## Publishing

This repository is Projen-managed. [`.projenrc.ts`](./.projenrc.ts) owns the npm package identity, published files, preset exports, and release automation for `@catenarycloud/linteffect`. The published package excludes the `.ungram` grammar references.
