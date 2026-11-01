# Rule fixture tests

Add cases under `tests/specs/<preset>/<rule>/<scenario>/`:

```text
core/no-effect-do/construction/invalid.ts
core/no-effect-do/construction/invalid.ts.snap
core/no-effect-do/construction/valid.ts
core/no-effect-do/construction/valid.ts.snap
```

The preset must register the rule from `rules/<rule>.grit`. Separate scenarios by behavior, such as call forms or import conditions. Use `.ts` or `.tsx` files named `valid`, `invalid`, or variants such as `valid-no-imports`.

`tests/specs.test.ts` discovers the files and runs each against its selected rule. Pair `invalid.ts` and `valid.ts` around the same task. Preserve the result, failure behavior, and order of side effects so the reader can compare the implementations.

Define each example's inputs, schemas, and dependencies. Use `/** ... */` comments that identify correct, incorrect, or questionable usage and explain the composition choice directly. See the [fixture writing guidance](../../docs/rule-guidance.md#write-fixtures-as-learning-examples).

Fixture loading requires a nonempty `/** ... */` comment. Review the explanations and paired behavior when you change a fixture.

Give parser edge cases separate variants. An invalid fixture may use an obsolete API to demonstrate a migration; ordinary examples should not depend on undeclared globals.

Use generic domains and invented data. Reproduce the code shape behind application feedback without private source, identifiers, or records.

| Task | Before | After |
| --- | --- | --- |
| Reject a bad check-in record before the welcome message; return the name for confirmation. | [Nested callbacks](core/no-flatmap-ladder/composition/invalid.ts) | [A name pipeline with tap](core/no-flatmap-ladder/composition/valid.ts) |
| Log a delivery before the status changes. | [Steps in a collection](core/no-effect-all-step-sequencing/execution-order/invalid.ts) | [Explicit sequence](core/no-effect-all-step-sequencing/execution-order/valid.ts) |
| Report a completed delivery. | [Raw console call](core/no-effect-sync-console/logging/invalid.ts) | [Effect log context](core/no-effect-sync-console/logging/valid.ts) |
| Read a counter. | [Manual Effect annotation](core/no-manual-effect-channels/operation-contracts/invalid.ts) | [Inferred operation](core/no-manual-effect-channels/operation-contracts/valid.ts) |

The [schema examples](core/no-return-in-arrow/schema-predicates/valid.ts) keep v4 check predicates intact. The [refinement](core/no-return-in-arrow/schema-predicates/valid-refinement.ts) narrows the decoded type.

The [batch validation example](core/no-effect-all-step-sequencing/independent-results/valid.ts) treats individual failures as results. It contrasts a collection of outcomes with an ordered workflow.

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
