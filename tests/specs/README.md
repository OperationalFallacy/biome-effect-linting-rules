# Rule fixture tests

Add cases under `tests/specs/<preset>/<rule>/<scenario>/`:

```text
core/no-effect-do/construction/invalid.ts
core/no-effect-do/construction/invalid.ts.snap
core/no-effect-do/construction/valid.ts
core/no-effect-do/construction/valid.ts.snap
```

The preset must register the rule from `rules/<rule>.grit`. Separate scenarios by behavior, such as call forms or import conditions. Use `.ts` or `.tsx` files named `valid`, `invalid`, or variants such as `valid-no-imports`.

`tests/specs.test.ts` discovers the files and runs each against its selected rule. Fixtures are source text, so incomplete declarations and invalid API calls need no TypeScript suppression comments.

A valid case must produce zero diagnostics. An invalid case must produce at least one diagnostic, including warnings. Parse errors, plugin-load failures, and skipped diagnostics fail the test.

Run the cases:

```sh
yarn vitest run tests/specs.test.ts
```

Update snapshots after an intentional fixture or rule change, then review the diff:

```sh
yarn vitest run tests/specs.test.ts --update
```

The implementation follows Biome's `gen_tests!`, `run_test`, and `run_plugin_test`. Read their source from the sparse checkout:

```sh
git -C refs/biome show HEAD:crates/tests_macros/src/lib.rs
git -C refs/biome show HEAD:crates/biome_js_analyze/tests/spec_tests.rs
```
