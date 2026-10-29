# Write a lint rule

## Development

The rules are in `rules/*.grit`. The presets in `configs/*.jsonc` and the root `biome.jsonc` list the rules Biome loads. Edit [`.projenrc.ts`](../.projenrc.ts) to change the package metadata and Projen tasks.

Use `yarn test` to run the tests. Use `yarn build` to regenerate the project files, run the tests, and create the npm archive.

## Match and test the rule

Target one concrete pattern. Put the diagnostic on the expression that needs attention. Limit the match to the relevant call or pipeline, and test that nearby valid code stays clear.

Explain what the rule flags and why it matters, then describe how to fix the code. Use complete sentences and keep the conditions, examples, and exceptions that affect the rewrite. Follow the [unslop guide](unslop.md) for natural prose. Distinguish package conventions from errors in the library itself.

Use an error for a required change. Use a warning or informational diagnostic to request a review. Check the diagnostic's severity and location in tests. Use `It catches ...` for inputs that produce diagnostics and `It allows ...` for valid inputs.

Add new test fixtures under `tests/specs/<group>/<rule>/<scenario>/`. The group names a preset in `configs/`. The rule names the production file in `rules/`, without `.grit`. Separate call forms and import conditions into scenario directories. Name fixtures `invalid.ts`, `valid.ts`, or a variant such as `invalid-generic.ts`. The [fixture test README](../tests/specs/README.md) describes the directory layout and test commands.

`tests/specs.test.ts` creates one test per fixture. `FixtureRepository.discoverFixtures` in `tests/support/fixtureRepository.ts` finds the files and checks that the preset registers each rule. Add a fixture to add a test. Do not create another per-rule test file or list fixture paths in code. The current examples test Effect.bind, Effect.async, Effect.Do, and nested Effect.flatMap calls.

`FixtureRunner.runFixture` loads the fixture and production rule through `FixtureRepository.loadFixture`. It runs only that rule through Biome's SDK. Effect scopes release the WASM workspace and memory filesystem after each fixture, including failed runs. Biome parses the source and executes the rule. The snapshots retain the original SDK diagnostics with their messages and byte spans.

A valid fixture must produce no diagnostics. An invalid fixture must produce at least one rule diagnostic. Warnings count even when the exit status is zero. Source parse errors, plugin-load failures, and skipped diagnostics fail the test.

Vitest saves the fixture text and runner result beside each fixture in a `.ts.snap` or `.tsx.snap` file. Biome supplies the diagnostic messages and source locations, as well as severity, tags, and advice. Do not copy those values into assertions.

Run `yarn vitest run tests/specs.test.ts`. After an intentional change to a fixture or diagnostic, add `--update` and review the snapshot diff. Whitespace changes can change recorded source spans. Do not regenerate snapshots to conceal an unexplained failure.

Some tests still use `tests/rules/<rule>/` and `tests/support/rules.ts`. Use `tests/specs/` for new examples. Its README names the Biome test functions used as references and gives commands to read their source.

Read lint fixtures as source text. Keep them outside the project typecheck and do not import them as executable modules. A fixture may deliberately contain an invalid API or incomplete declarations. It needs no TypeScript suppression comments. Test the rule's response to that source, and keep tests for the package's CLI and WASM runner in `tests/runtime/`.

`FixtureRunner` loads the selected rule into Biome's memory filesystem and opens a workspace for that case. The test entry point runs discovery and execution through one Effect service graph.

Validate with a minimal Biome config that loads the rule alone. Test real code and a regression that should trigger the rule before you add it to `biome.jsonc` and the relevant presets.

Biome matches Grit patterns against source syntax within one file. Use captures and scoped `contains` checks.

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
