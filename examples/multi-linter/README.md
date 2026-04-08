# Multi-linter example

This example shows the supported compatibility model for `@catenarycloud/linteffect`:

- Biome loads the canonical Grit rules from this package.
- Oxlint can load the full 48-rule alternate pack through the package's JS plugin export.
- lintcn can vendor the full translated source pack from this repository's `.lintcn/linteffect` directory.

The config files use a `.example` suffix so the published package does not accidentally expose auto-discovered linter configs from `node_modules`.

Copy these files into your repository root, rename them to the live filenames you want, and then run all three tools in the same CI job or local workflow.
