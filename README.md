# lintEffect

`lintEffect` is a Biome shareable config package. The npm package name is `@catenarycloud/linteffect`.

Use the package through `extends` instead of copying long plugin path lists into each repository.

This package gives teams a reusable base rule pack for Effect-flavored TypeScript and pushes code toward flatter, more explicit flows.

## Use cases

Use this package when you want Biome to steer code away from common Effect anti-patterns such as:

- nested `Effect.*` combinator ladders
- nested `Effect.gen`
- imperative step arrays hidden inside `Effect.all`
- block-bodied callback churn inside pipelines
- wrapper-heavy control flow that obscures the main Effect path

Use it as a shared base. Add repository-local rules on top when your project has extra architecture constraints that should not ship as public rules.

## Install

```bash
npm install -D @biomejs/biome @catenarycloud/linteffect
```

`yarn add -D` and `pnpm add -D` work too. Install the package into `node_modules` so Biome can resolve the shipped `.grit` files.

If you use Yarn Berry, use the `node-modules` linker for this package shape because current Biome package `extends` resolution for Grit plugins does not work correctly through Plug'n'Play.

## Integrate into `biome.jsonc`

In a single-package repository, use:

```jsonc
{
  "extends": ["@catenarycloud/linteffect"]
}
```

In a monorepo, put that in the root `biome.jsonc`, then let package-level Biome configs extend the root config.

The package root is the recommended config entrypoint, so consumers get one short entrypoint instead of a long `plugins` array.

## Add repository-local rules

Do not put project-specific architecture rules into this package.

If your repository has local rules, layer them on top in your own `biome.jsonc`:

```jsonc
{
  "extends": ["@catenarycloud/linteffect"],
  "plugins": [
    "./biome-plugins/my-project-specific-rule.grit"
  ]
}
```

That split keeps the published package generic and lets each consumer own private rules independently.

## Tooling advisory

Couple this rule pack with `@effect/tsgo`, `@typescript/native-preview`, and the `@effect/language-service` TypeScript language-service plugin in `tsconfig.json`.

Biome rules enforce code-shape constraints. That tooling gives the agent Effect-aware editor and project-mode diagnostics, so it can verify that a remediation still respects the underlying Effect contract.

Reference project: [Effect Language Service](https://github.com/Effect-TS/language-service).

Biome provides fast feedback, which matters during iterative remediation.

In the Tradedal.com codebase, a Biome summary lint over the backend Effect surface processed hundreds of TypeScript files with tens of thousands lines of code in about ~5 seconds on Mac Mini M2. It stays in the same feedback class as project-mode `tsgo` diagnostics and keeps remediation loops fast enough for coding agents.

That timing fits coding-agent remediation loops. Agents can rerun it often, but broad noisy scopes still carry a cost.

## How diagnostics help agents

Each rule emits one focused diagnostic at the offending call site. The diagnostic message is the remediation hint: it tells the agent what not to do, why that pattern is harmful, and which Effect shape to rewrite toward.

Severity matters. Treat `error` as a blocking rewrite signal. Treat `warning` or `info` as guidance that improves code shape but does not need to stop the whole edit loop.

This works well for agents because the feedback is local and immediate. The agent can lint one file, read the message, rewrite the exact method, and rerun Biome without guessing which architectural preference the repository expects.

These rules are opinionated and can require substantial cleanup if you enable them all at once. Start with the most important rules or code paths, then expand after the repository absorbs the style.

## What remediation looks like

These rules matter when they force code into a clearer shape. A few representative examples:

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

This is small on its own, but repeated callback scaffolding makes pipelines noisier and easier to bloat with local control flow.

## Repository layout

- `biome.jsonc`: package root config entrypoint
- `rules/*.grit`: shipped Biome Grit rules
- `examples/biome.effect.jsonc`: consumer example
- `docs/rule-guidance.md`: rule authoring guidance
- `scripts/refresh-biome-grammars.ts`: contributor refresh step for Biome grammar references

## Consumer model

The recommended consumer contract is:

1. Install `@catenarycloud/linteffect`.
2. Add `extends: ["@catenarycloud/linteffect"]` to `biome.jsonc`.
3. Layer repository-local overrides on top of that shared base only when needed.

This keeps package upgrades, provenance, and version pinning under npm instead of local vendoring.

## Direct rule paths

Direct plugin paths remain available as a fallback for advanced consumers who want to compose a custom subset:

```jsonc
{
  "plugins": [
    "./node_modules/@catenarycloud/linteffect/rules/no-effect-ladder.grit"
  ]
}
```

The package internally expands to installed `node_modules/@catenarycloud/linteffect/rules/*.grit` paths because current Biome package-based `extends` resolution does not load Grit plugins relative to the package config file itself.

## Contributor grammar references

The repository keeps `rules/js.ungram` and `rules/gritql.ungram` only for rule authoring and rule updates.

Refresh them with:

```bash
yarn refresh:biome-grammars --ref <biome-git-ref>
```

Use an explicit Biome tag or commit when aligning the package to a specific upstream Biome version.

## Publishing

This repository is Projen-managed. `.projenrc.ts` owns the npm package identity, published files, and release automation shape for `@catenarycloud/linteffect`. The published package excludes the contributor-only `.ungram` grammar references.
