# lintEffect

`lintEffect` is a Biome rule pack that keeps Effect code declarative, flat, explicit, and easy to remediate.

The rule set pushes code away from nested combinator towers, nested `Effect.gen`, hidden sequencing, callback scaffolding, and wrapper-heavy control flow. The rules keep the main Effect path visible, keep sequencing intentional, and make diagnostics local enough that an agent or a human can rewrite the exact offending shape quickly.

[`docs/rule-guidance.md`](./docs/rule-guidance.md) explains how to add rules.

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

If you use Yarn Berry, set `nodeLinker: node-modules`. Biome does not resolve Grit plugin paths from package `extends` correctly through Plug'n'Play right now.

## Integrate into `biome.jsonc`

In a single-package repository, use:

```jsonc
{
  "extends": ["@catenarycloud/linteffect"]
}
```

In a monorepo, put that in the root `biome.jsonc`, then let package-level Biome configs extend the root config.

The package root is the recommended config entrypoint. It keeps `biome.jsonc` short and avoids a long `plugins` array.

## Add repository-local rules

If your repository has local rules, add them on top of the package in `biome.jsonc`:

```jsonc
{
  "extends": ["@catenarycloud/linteffect"],
  "plugins": [
    "./biome-plugins/my-project-specific-rule.grit"
  ]
}
```

## Tooling advisory

Couple this rule pack with `@effect/tsgo`, `@typescript/native-preview`, and the `@effect/language-service` TypeScript language-service plugin in `tsconfig.json`.

Biome rules enforce code-shape constraints. Tsgo adds fast compile feedback. Effect LSP adds editor and project-mode diagnostics. The combination keeps remediation feedback fast.

[Effect Language Service](https://github.com/Effect-TS/language-service)

In the Tradedal.com codebase, a Biome lint over the backend Effect surface processes hundreds of TypeScript files with tens of thousands of lines of code in about 5 seconds on Mac Mini M2. It stays in the same feedback class as project-mode `tsgo` diagnostics and keeps remediation loops fast enough for coding agents. Agents usually lint a smaller file set, so feedback is faster.

That timing fits coding and remediation loops.

## How diagnostics help agents

Each rule emits one focused diagnostic at the offending call site. The diagnostic message is the remediation hint: it tells the agent what not to do, why that pattern is harmful, and which Effect shape to rewrite toward.

The agent can lint one file, read the message, rewrite the exact method, and rerun Biome without guessing which architectural preference the repository expects.

These rules are opinionated and can require substantial cleanup if you enable them all at once. Start with the most important rules or code paths. Expand from there.

## Examples

A few representative examples:

### 1. Nested Effect ladder to flat pipeline

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

The remediation moves `getUserId` to the pipeline source, applies one `Effect.flatMap` for the fetch step, and applies one `Effect.map` for the projection step. The data flow now reads in execution order instead of wrapping one `Effect.*` call inside another.

### 2. Nested `Effect.gen` to one generator

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

The remediation removes hidden sequencing and keeps one method responsible for one visible flow.

### 3. Sequential side effects hidden in `Effect.all`

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

The second form makes sequencing intentional instead of hiding it in an array.

### 4. Block-bodied callback to expression callback

```ts
const normalized = Option.map(value, (current) => {
  return current.trim();
});
```

```ts
const normalized = Option.map(value, (current) => current.trim());
```

Repeated callback scaffolding makes pipelines noisier and easier to bloat with local control flow.

## Repository layout

- `biome.jsonc`: package root config entrypoint
- `rules/*.grit`: shipped Biome Grit rules
- `examples/biome.effect.jsonc`: package usage example
- `docs/rule-guidance.md`: rule authoring guidance
- `scripts/refresh-biome-grammars.ts`: refresh step for Biome grammar references

## Usage model

The recommended setup is:

1. Install `@catenarycloud/linteffect`.
2. Add `extends: ["@catenarycloud/linteffect"]` to `biome.jsonc`.
3. Layer repository-local overrides on top of that shared base only when needed.

This keeps upgrades, provenance, and version pinning under npm instead of local vendoring.

## Direct rule paths

Direct plugin paths also work when you want to compose a custom subset:

```jsonc
{
  "plugins": [
    "./node_modules/@catenarycloud/linteffect/rules/no-effect-ladder.grit"
  ]
}
```

The package resolves to installed `node_modules/@catenarycloud/linteffect/rules/*.grit` paths because current Biome package-based `extends` resolution does not load Grit plugins relative to the package config file itself.

## Grammar references

The repository keeps `rules/js.ungram` and `rules/gritql.ungram` only for rule authoring and rule updates.

Refresh them with:

```bash
yarn refresh:biome-grammars --ref <biome-git-ref>
```

Use an explicit Biome tag or commit when aligning the package to a specific upstream Biome version.

## Publishing

This repository is Projen-managed. `.projenrc.ts` owns the npm package identity, published files, and release automation shape for `@catenarycloud/linteffect`. The published package excludes the `.ungram` grammar references.
