# lintEffect

`lintEffect` is a collection of Biome lint rules for TypeScript projects that use Effect v4. The rules keep related steps together and make each operation's decisions and results explicit.

> I developed and maintain these rules for [tradedal.com](https://tradedal.com), an options trading app. I use them to keep the code declarative and reduce unnecessary boilerplate.
>
> Roman Naumenko, author and maintainer

The rules identify anti-patterns such as nested `Effect.gen` blocks and consecutive operations written with `Effect.all`. Each diagnostic explains the pattern and suggests how to rewrite the code.

The rules target Effect 4.0.6. Version 0.0.9 is the final release for Effect v3. Read the [migration notes](docs/effect-v4.md) for the changes.

You can use the full rule set or choose a smaller preset. Start with a smaller preset to introduce the rules to an established project.

For example, this code uses nested Effect calls to fetch a user and read their profile:

```ts
const loadUser = Effect.map(
  Effect.flatMap(getUserId, (userId) => fetchUser(userId)),
  (user) => user.profile
);
```

In a pipeline, the calls appear in the order they run:

```ts
const loadUser = getUserId.pipe(
  Effect.flatMap((userId) => fetchUser(userId)),
  Effect.map((user) => user.profile)
);
```

In this demo, Codex uses the rules to refactor [Messages.ts from the Effect Discord bot](https://github.com/Effect-TS/discord-bot/blob/main/packages/discord/src/Messages.ts).

![Messages refactor demo](./media/messagesRefactor.gif)

## Try it on your code

You can check your code with `npx` without changes to your project's dependencies or configuration. Run this command from your project directory:

```bash
npx @catenarycloud/linteffect check src --preset=core
```

The command requires Node.js 24 or newer. It checks `src` with the core preset and leaves your source files unchanged. It runs Biome's WebAssembly engine in the same Node.js process, independently of your project's Biome settings. It loads the selected rules into an isolated in-memory workspace and creates no temporary configuration files.

Directory targets include supported files recursively. The CLI skips dependency and version-control directories during traversal, and it never follows directory symlinks. Files larger than 1 MiB fail the check.

Choose `core`, `web`, `ts-type`, or `full` with `--preset`. The [preset table](#presets) describes each group. If you omit `--preset`, the command uses `full`.

The package includes a [lint guide](./docs/linting.md) for agents to fix lint errors and check the result. Add `--guide` to include its text in the command output, before the diagnostics:

```bash
npx @catenarycloud/linteffect check src --preset=core --guide
```

If an agent runs this command, it can read the guide along with the lint results.

Use `--help` for the command options. To try a prerelease, use `@catenarycloud/linteffect@dev` in the command.

## Add it to your project

### Install and configure

Install Biome and the rules with your project's package manager:

```bash
npm install -D @biomejs/biome @catenarycloud/linteffect
```

```bash
yarn add -D @biomejs/biome @catenarycloud/linteffect
```

```bash
pnpm add -D @biomejs/biome @catenarycloud/linteffect
```

Create a `biome.json` or `biome.jsonc` with the core preset in `extends`. If you already have either file, add the preset to its `extends` array and keep the rest of your configuration:

```jsonc
{
  "extends": ["@catenarycloud/linteffect/core"]
}
```

The presets use Biome 2.6.3's configuration schema. The standalone CLI bundles the matching WebAssembly engine and does not need a separate Biome installation.

With Yarn Berry, set `nodeLinker: node-modules` so Biome can find the rules in `node_modules`.

### Run your project checks

After you save the configuration, run Biome from the project directory:

```bash
npx biome lint src
```

Biome now reads the preset as part of your project configuration. Your scripts and CI checks will also use these rules when they run Biome with this configuration.

### Presets

To change presets, replace the package path in `extends` with one from this table. For a trial run, pass the preset name to the CLI, such as `--preset=core`.

| Package path | Rules included |
| --- | --- |
| `@catenarycloud/linteffect` | The full preset, also available as `@catenarycloud/linteffect/recommended` |
| `@catenarycloud/linteffect/core` | Effect composition, control flow, and execution order |
| `@catenarycloud/linteffect/web` | React hooks, atom access, state updates, and Vanilla Extract styles |
| `@catenarycloud/linteffect/ts-type` | Type assertions, data guards, optional values, and string statuses |

### Lint findings

Each diagnostic message suggests a rewrite.

The [guide](./docs/linting.md) explains the diagnostics and how to fix the code. Ask agents to read it before they make changes. Provide the guide separately when the agent uses your project's Biome setup.

## Develop and contribute

Clone this repository and install its development dependencies with `yarn install`. Run `yarn test` to check the rules and `yarn build` to regenerate project files, run the tests, and create the npm archive.

`yarn lint` checks implementation code with the installed `@catenarycloud/linteffect@dev` package. `yarn lint:dev` selects it explicitly. Yarn locks the installed release; run `yarn up @catenarycloud/linteffect@dev` to update it.

`yarn lint:local` checks the same files with this checkout's rules. Both configurations share formatting, import organization, recommended Biome rules, and Git ignore settings. Fixture source files stay outside these checks because they contain deliberate violations. Pass a path to focus either check:

```sh
yarn lint:dev src/cli.ts
yarn lint:local src/cli.ts
```

Tests and builds run `yarn lint`. To use the checkout's rules throughout a development run, set `BIOME_CONFIG_PATH=biome.local.jsonc`, for example `BIOME_CONFIG_PATH=biome.local.jsonc yarn test`. The published package can report findings that have already been fixed in the checkout; compare both commands before changing code to satisfy a diagnostic.

`.projenrc.ts` generates both configurations and their shared `biome.base.jsonc`. It derives the local plugin list from `configs/full.jsonc`.

Add rule test cases using the [fixture layout and commands](tests/specs/README.md).

The rules are in `rules/*.grit`, and the files in `configs/` list the rules for each preset. The project uses Projen. Edit [`.projenrc.ts`](./.projenrc.ts) to change package metadata or build tasks.

The [rule development guide](./docs/rule-guidance.md) explains how to write a rule, test it against valid and invalid code, and add it to a preset. Follow [docs/unslop.md](./docs/unslop.md) for documentation and diagnostic messages.

## Forks and similar projects

This project has been adapted for other linters through community forks:

- [OXC Effect](https://github.com/shekohex/oxc-effect-linting-rules) by shekohex adapts the rules for Oxlint and ESLint. It targets Effect v4.

Effect also provides tools to check Effect code:

- [Effect Language Service](https://github.com/Effect-TS/language-service) adds Effect diagnostics, quick fixes, and refactors to your editor. It checks for problems such as unresolved service requirements and Effects that never execute.
- [Effect tsgo](https://github.com/Effect-TS/tsgo) brings those tools to the native TypeScript compiler for TypeScript 7 and newer. It also supports type-aware Effect rules in Oxlint, with an [Oxlint setup guide](https://github.com/Effect-TS/tsgo/blob/main/docs/README.md).
