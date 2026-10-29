# AGENTS.md

## Project

`lintEffect` publishes `@catenarycloud/linteffect`, a collection of Biome Grit rules for Effect v4 TypeScript projects. The package contains rules, preset configurations, and a CLI. Grit files match source syntax and emit diagnostics; the tests run those rules through Biome.

Read [README.md](README.md) for package usage. For rule changes, read [docs/rule-guidance.md](docs/rule-guidance.md). The packaged [docs/linting.md](docs/linting.md) tells consumers and their agents how to interpret diagnostics and fix their code.

## Repository layout

| Path | Purpose |
| --- | --- |
| `rules/*.grit` | Rule matchers, diagnostic messages, and severities. |
| `rules/js.ungram`, `rules/gritql.ungram` | Grammar references for rule development. These files are excluded from the npm package. |
| `configs/core.jsonc` | Effect composition, control flow, and execution order. |
| `configs/web.jsonc` | React, atom, and Vanilla Extract rules. |
| `configs/ts-type.jsonc` | Type assertions, data guards, optional values, and status rules. |
| `configs/full.jsonc` | Full preset, exported through the package root and `/recommended`. |
| `biome.jsonc` | Default configuration. Extends the installed dev package and the shared settings. |
| `biome.base.jsonc` | Shared formatting, import organization, recommended Biome rules, and implementation file selection. |
| `biome.local.jsonc` | Development configuration with checkout plugins generated from `configs/full.jsonc`. |
| `bin/linteffect.mjs`, `src/cli.ts` | Node entry point and native Effect CLI commands, preset loading, and file checks. |
| `src/biome.ts` | Shared Effect service for scoped WASM workspaces and plugin diagnostics. |
| `lib/` | Generated JavaScript and declarations for the published CLI. `yarn compile` builds it from `src/`. |
| `tests/specs.test.ts`, `tests/specs/` | One test per source fixture. The test reads the group and rule from its directory path and saves a snapshot beside the fixture. |
| `tests/support/` | Effect services for fixture path parsing, discovery, loading, and execution. |
| `tests/composition.test.ts`, `tests/composition/` | Valid source checked with every full-preset rule enabled. |
| `tests/runtime/` | CLI behavior, WASM resource cleanup, and diagnostic parity with native Biome. |
| `examples/biome.effect.jsonc` | Example consumer configuration. |
| `scripts/refresh-biome-grammars.ts` | Updates the grammar references for a selected Biome revision. |
| `scripts/profile-rules.ts` | Measures preset or individual rule performance against source files. |
| `.projenrc.ts` | Source for package metadata, exports, dependencies, tasks, and generated workflows. |
| `.projen/` | Generated project tasks, dependency records, and generated-file inventory. |
| `.github/workflows/` | Build, dependency update, pull request, and release workflows. |
| `release-please-config*.json`, `.release-please-manifest.json` | Release Please configuration and release versions. |

`ROADMAP.md` records proposed work. Check package exports and the CLI implementation for current behavior.

## Common changes

For a rule change, edit its `.grit` file and add fixtures that demonstrate the problem and nearby valid cases. Test the diagnostic's location and severity as well as whether it appears. Explain the matched pattern, its consequence, and the fix in complete sentences. Preserve conditions and exceptions that affect the rewrite.

For a new rule, register it in the appropriate presets and `configs/full.jsonc`, then run `yarn projen` to update `biome.local.jsonc`. Preset plugin paths use `./node_modules/@catenarycloud/linteffect/rules/`. The CLI reads those files from the package and loads their contents into the WASM memory filesystem for trial runs. Check both installed-project use and CLI use after configuration changes.

Edit `.projenrc.ts` for generated package settings, then run `yarn projen`. Review the generated diff before you stage it. `package.json`, `.projen/`, and generated workflow files receive their settings from this source. Release Please manages release version and changelog updates.

## Local commands

Use the Yarn version declared in `package.json`. Run these commands from the repository root:

| Command | Purpose |
| --- | --- |
| `yarn install --immutable` | Install dependencies from the lockfile. |
| `yarn test` | Run the rule and runtime tests, then the project typecheck. |
| `yarn typecheck` | Check project code and tests with `tsconfig.json`, also used by editors. |
| `yarn effect:diagnostics` | Report the Effect Language Service's type-aware diagnostics. |
| `yarn lint` | Check implementation code with the installed dev package. Honors `BIOME_CONFIG_PATH`. |
| `yarn lint:dev` | Explicitly check with the installed dev package. Accepts paths and Biome flags. |
| `yarn lint:local` | Check with the checkout's current rules. Accepts paths and Biome flags. |
| `BIOME_CONFIG_PATH=biome.local.jsonc yarn test` | Run development checks with the checkout's rules throughout. |
| `yarn compile` | Compile the Effect CLI and Biome service for Node.js. |
| `yarn vitest run tests/specs.test.ts` | Run all fixtures in `tests/specs/`. |
| `yarn projen` | Regenerate project files from `.projenrc.ts`. |
| `yarn build` | Regenerate project files, run tests, and create the npm archive under `dist/js/`. |
| `yarn pack:dry-run` | Inspect the npm package contents. |
| `node bin/linteffect.mjs guide --print` | Print the local copy of the consumer guide. |

For rule changes, run the relevant tests and then the full suite. For package or workflow changes, run the build and review its generated files. Documentation changes need a prose and link review; use `git diff --check` to check whitespace.

The installed dev release is locked in `yarn.lock`. Update it with `yarn up -R @catenarycloud/linteffect` so the dependency keeps its dev tag. Compare published and local diagnostics during rule development. Do not suppress findings or change valid code solely to accommodate a published matcher bug.

`tsconfig.json` configures the Effect Language Service. The compile and typecheck tasks apply its compiler patch before they run TypeScript. The workspace compiler and editor use that configuration. Effect errors fail compilation; warnings and suggestions remain visible. Repair the service composition or implementation that caused a diagnostic. Do not widen Effect channels or add casts to hide it.

## Releases

The release workflow uses Release Please on `master` for stable releases and `dev` for prereleases. Stable packages use npm's `latest` tag; prereleases use `dev`. npm publication uses GitHub OIDC trusted publishing. Change generated release workflow behavior in `.projenrc.ts`.

## Test label standard

Use explicit behavioral labels for Vitest cases.

1. Use `It catches ...` for invalid input that must produce diagnostics.
2. Use `It allows ...` for valid input that must pass without diagnostics.
3. Keep labels implementation-neutral and behavior-focused. Describe the behavior with `It catches ...` or `It allows ...`.

## Prose guide

Apply [the unslop guide](docs/unslop.md) to documentation and text that users read.
