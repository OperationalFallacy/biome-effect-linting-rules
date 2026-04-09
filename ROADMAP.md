# Roadmap

## Package shape

Keep one npm package first.

Expose multiple preset configs from the same package:
- `@catenarycloud/linteffect/core`
- `@catenarycloud/linteffect/web`
- `@catenarycloud/linteffect/ts-type`
- `@catenarycloud/linteffect/full`

Ship `core` as the default preset. Keep `web` and `ts-type` opt-in.

Reason:
- simpler adoption
- one release flow
- one docs surface
- lower maintenance

Split into multiple packages only if preset-specific dependencies, release cadence, or package size become a real problem.

## CLI

Build a zero-install CLI on top of the same rule engine:
- `npx @catenarycloud/linteffect check file.ts`
- `npx @catenarycloud/linteffect rewrite file.ts`
- `npx @catenarycloud/linteffect rewrite src --rule no-nested-effect-gen`
- `npx @catenarycloud/linteffect rewrite src --preset core`

The CLI should bundle runtime, parser, and rules so users can try rewrites without installing Biome or wiring plugin config first.

The intended workflow is ephemeral repo-local analysis:
- point the CLI at one file or a small path
- run packaged Biome and packaged rules through a temp config
- return diagnostics or apply deterministic rewrites
- let an agent iterate by re-running the same command after edits

This can live as a separate subpackage on top of the same shared rule engine. The pack stays the integration product. The CLI subpackage becomes the zero-setup trial and agent entry point.

## Product split

Use one codebase for two entry points:
- Biome pack for team enforcement and repo integration
- CLI for trial, migration, and one-off rewrites
