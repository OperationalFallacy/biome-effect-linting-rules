# Compatibility with Oxlint and lintcn

Biome remains the canonical implementation for the full `lintEffect` ruleset.

This fork also ships alternate implementations for the rules that map cleanly to the other ecosystems:

- `rules/*.grit`: canonical Biome rules
- `oxlint/plugin.mjs`: Oxlint plugin export
- `oxlint/recommended.mjs`: recommended Oxlint config export
- [`.lintcn/linteffect`](../.lintcn/linteffect): lintcn source pack
- [`compat/ported-rules.mjs`](../compat/ported-rules.mjs): source of truth for alternate implementations and per-target coverage

## Current model

- Biome is the source of truth for all rule names, rule text, and the hard cases.
- Oxlint gets alternate implementations where the rule is expressible through the ESLint-compatible JS plugin API.
- lintcn gets alternate implementations where a custom Go rule is a better fit or where teams want to stay entirely in lintcn.

This is intentionally not a coexistence-only story anymore. The goal is alternate implementations of the same policy, with Biome still acting as the reference pack.
The current translated pack now has full rule-name parity across Oxlint and lintcn.

## Coverage Summary

Current translated coverage:

- Oxlint: 48 rules
- lintcn: 48 rules
- lintcn-only today: none
- Biome-only today: none

## Shared Oxlint + lintcn Coverage

These exact rule names are currently implemented in both tools:

- `no-if-statement`
- `no-switch-statement`
- `no-ternary`
- `no-return-null`
- `no-try-catch`
- `prevent-dynamic-imports`
- `no-effect-async`
- `no-effect-bind`
- `no-effect-do`
- `no-effect-fn-generator`
- `no-effect-never`
- `no-effect-as`
- `no-option-as`
- `no-runtime-runfork`
- `no-react-state`
- `no-string-sentinel-return`
- `no-string-sentinel-const`
- `no-manual-effect-channels`
- `no-effect-type-alias`
- `no-model-overlay-cast`
- `no-fromnullable-nullish-coalesce`
- `no-effect-sync-console`
- `no-atom-registry-effect-sync`
- `no-call-tower`
- `no-effect-all-step-sequencing`
- `no-effect-call-in-effect-arg`
- `no-effect-orElse-ladder`
- `no-effect-succeed-variable`
- `no-flatmap-ladder`
- `no-iife-wrapper`
- `no-match-void-branch`
- `no-nested-effect-gen`
- `no-option-boolean-normalization`
- `no-pipe-ladder`
- `no-branch-in-object`
- `no-arrow-ladder`
- `no-effect-ladder`
- `no-effect-side-effect-wrapper`
- `no-effect-wrapper-alias`
- `no-inline-runtime-provide`
- `no-match-effect-branch`
- `no-nested-effect-call`
- `no-return-in-arrow`
- `no-return-in-callback`
- `no-unknown-boolean-coercion-helper`
- `no-render-side-effects`
- `no-wrapgraphql-catchall`
- `warn-effect-sync-wrapper`

## lintcn-only Coverage

There are currently no lintcn-only rule names. The lintcn source pack and the Oxlint plugin now cover the same 48 translated rule names.

## Biome-only Coverage

There are currently no Biome-only rules. Both Oxlint and lintcn now have an alternate implementation for every Biome rule name.

## Oxlint Usage

Use the package as an Oxlint JS plugin:

```ts
import { defineConfig } from "oxlint";
import { oxlintRecommended } from "@catenarycloud/linteffect/oxlint-recommended";

export default defineConfig(oxlintRecommended);
```

If you want manual control instead of the recommended export:

```ts
import { defineConfig } from "oxlint";
import { oxlintRecommendedRules } from "@catenarycloud/linteffect/oxlint-recommended";

export default defineConfig({
  jsPlugins: ["@catenarycloud/linteffect/oxlint-plugin"],
  rules: oxlintRecommendedRules,
});
```

## lintcn Usage

lintcn consumes repository-local Go rule sources. Add the source pack from this repository:

```bash
npx lintcn add https://github.com/OperationalFallacy/biome-effect-linting-rules/tree/master/.lintcn/linteffect
```

That vendors the currently ported rules into the consumer's local `.lintcn/` tree, after which the project can run:

```bash
npx lintcn lint
```

This repository also keeps a Go `rule_tester` suite for every lintcn rule so parity work can be validated with snapshots before release.
It also keeps a Node-based Oxlint fixture suite so every translated Oxlint rule has at least one valid and one invalid test case.

## Design Split

- Oxlint is the preferred target for the direct syntactic rules that fit a fast AST-only pass.
- lintcn is still the preferred target when teams want repository-local Go rules or when parity work needs heavier custom analysis first.
- Biome remains the reference implementation for rule intent and source patterns.

## Example Files

See [`examples/multi-linter`](../examples/multi-linter) for a working set of example files.

The example config files use a `.example` suffix so they are safe to publish in `node_modules` without being auto-discovered as live Oxlint or Biome configs. Copy them into your repository root and rename them when you adopt the setup.
