# Roadmap

## Current package

One npm package contains the Biome rules, presets, and CLI. The package root and `/recommended` export the full preset. Smaller presets are available at `/core`, `/web`, and `/ts-type`.

The CLI can check existing code with a temporary configuration and print the guide. It reports diagnostics. Users or their coding agents make the changes.

## Preset choices

Consider making `core` the default for trial runs so an existing project starts with fewer rules. The current CLI default is `full`. A `/full` package export could make that preset's name explicit alongside the smaller presets.

Keep the presets in one package while they share dependencies and a release schedule. Separate packages may become useful if their dependencies, release schedules, or sizes diverge.

## Automatic rewrites

Explore automatic rewrites for rules with a deterministic, behavior-preserving fix. A future `rewrite` command could accept a file or directory and select a rule or preset. This needs valid and invalid examples that establish when a rewrite is safe.

Keep the CLI in the same package while it uses the same Biome runtime and rules. A separate CLI package remains an option if it develops different dependencies or release requirements.
