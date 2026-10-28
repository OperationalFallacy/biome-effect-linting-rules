# Write a lint rule

## Development

The rules are in `rules/*.grit`. The presets in `configs/*.jsonc` and the root `biome.jsonc` list the rules Biome loads. Edit [`.projenrc.ts`](../.projenrc.ts) to change the package metadata and Projen tasks.

Use `yarn test` to run the tests. Use `yarn build` to regenerate the project files, run the tests, and create the npm archive.

## Match and test the rule

Target one concrete pattern. Put the diagnostic on the expression that needs attention. Limit the match to the relevant call or pipeline, and test that nearby valid code stays clear.

Explain what the rule flags and why it matters, then describe how to fix the code. Use complete sentences and keep the conditions, examples, and exceptions that affect the rewrite. Follow the [unslop guide](unslop.md) for natural prose. Distinguish package conventions from errors in the library itself.

Use an error for a required change. Use a warning or informational diagnostic to request a review. Check the diagnostic's severity and location in tests. Use `It catches ...` for inputs that produce diagnostics and `It allows ...` for valid inputs.

Assert the structured diagnostics from Biome's JSON report: their count, severity, and source location. Valid fixtures should produce an empty diagnostic list. Allow prose edits to change diagnostic messages independently of these assertions.

Validate with a minimal Biome config that loads the rule alone. Test real code and a regression that should trigger the rule before you add it to `biome.jsonc` and the relevant presets.

The bundled Grit integration matches source syntax and reports diagnostics. Use captures and scoped `contains` checks; its analysis stays within one file.

Consult `rules/js.ungram` and `rules/gritql.ungram` for node names. Refresh these grammar references with:

```bash
yarn refresh:biome-grammars --ref <biome-tag-or-commit>
```

The published package includes `.grit` rules and excludes these grammar references.

## Configure individual rules

Add a rule from your repository to `plugins` alongside the preset you use:

```jsonc
{
  "extends": ["@catenarycloud/linteffect"],
  "plugins": ["./biome-plugins/my-project-specific-rule.grit"]
}
```

To select packaged rules individually, replace the package's `extends` entry with a `plugins` list:

```jsonc
{
  "plugins": [
    "./node_modules/@catenarycloud/linteffect/rules/no-effect-ladder.grit"
  ]
}
```
