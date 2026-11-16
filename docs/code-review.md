# lintEffect remediation checklist

## Prepare or commit the review batch

Review the implementation or documentation changed by the completed task. Apply every applicable check below to that scope, fix the defects it identifies, and stage the corrections as a coherent batch for review.

Organize the batch around changes that must work together. Keep a changed interface with its migrated callers because reviewing either part requires the other. Keep a changed matcher with its diagnostic, affected fixtures, snapshots, and preset registrations. Include generated files with the source changes that produce them.

Group complete fixture pairs by the composition problem under review. Size each batch so the reviewer can assess the changed behavior and its consequences in full. Keep related corrections together instead of reviewing individual files from the same correction separately. Give independently reviewable changes separate batches, and keep unrelated work and broad formatting changes out of them.

Apply the checklist to the staged batch while reading the complete operations and their consumers. Fix the identified defects and restage the affected files. Finish related corrections before the final validation round. Retain passing results for unchanged work, and repeat checks when a repair changes their inputs or answers an unresolved question about the changed behavior.

Commit batches that contain only low-risk mechanical documentation changes without waiting for the user, then continue with the next batch.

## Rule and package remediation

### Grit rules and diagnostics

- [ ] Inspect each changed matcher against its diagnostic and the grammar in `rules/js.ungram` and `rules/gritql.ungram`. Trace its scope searches through the matched operation. Correct matches that depend on unrelated code elsewhere in the file. Resolve overlapping matchers together so their requirements remain consistent.

- [ ] Compare each changed diagnostic with the offending expression and the rule's requirement. Verify its location and severity in the fixture result. Rewrite messages that omit why the code needs to change or how to correct it. Identify repository conventions as conventions so readers do not mistake them for Effect API requirements.

- [ ] Compare local and installed stable diagnostics on affected valid code. Correct the matcher responsible for a local false positive. Preserve valid counterexamples in the fixtures, and remove code changes or suppressions introduced solely to accommodate a published matcher bug.

### Fixtures and composition

- [ ] Follow each invalid and valid pair through its complete task. Align examples that perform different tasks around the same operation. Supply missing inputs and dependencies, and compile both fixtures against the installed packages. Correct changes to the result, failure behavior, or side-effect order unless the pair demonstrates and documents a behavioral defect that requires that change.

- [ ] Trace fixture discovery and execution through `FixtureParser`, `FixtureRepository`, and `FixtureRunner` with the production rules and preset registrations. Remove per-rule dispatch wrappers and copied runner contracts. Keep one concise valid/invalid pair per rule under the [fixture layout](rules-development.md#fixture-layout).

- [ ] Check each changed example with its selected rule, the full preset, and the built-in rules from `biome.base.jsonc` without fixture path overrides, following the [fixture checks](rules-development.md#run-and-review-fixtures). Verify zero diagnostics for valid examples and diagnostics only from the demonstrated rule for invalid examples. Count warnings and informational diagnostics. Repair missing or unrelated findings in the responsible matcher or fixture. Repair parse errors, plugin-load failures, and skipped diagnostics before accepting the result. Repeat these checks with staged sources and staged rules.

- [ ] Compare each changed snapshot with its source and actual SDK result. Inspect diagnostic counts, messages, severities, tags, advice, and byte spans together. Correct unexplained differences before updating the snapshot. Preserve the source and complete SDK result in the snapshot.

- [ ] Trace each test mutation of files or configuration through a subsequent read or lint by the production service. Preserve unaffected inputs so the result measures the intended change. Correct shared fixture state that survives into a fresh Layer graph.

### Presets and package generation

- [ ] Resolve each changed preset registration to its packaged rule. Compare `biome.local.jsonc` with `configs/full.jsonc`, correct missing registrations in the appropriate preset and full preset, and regenerate the local configuration with `yarn projen`. Preserve installed-package plugin paths. Verify both installed-project loading and CLI loading through the WASM memory filesystem.

- [ ] Compare changed package settings, tasks, and workflows with their source in `.projenrc.ts`. Move corrections made only in generated files into that source, regenerate, and review the resulting diff. Include the source responsible for each generated change. Preserve version and changelog updates managed by Release Please.

- [ ] Inspect the npm archive against the package exports and CLI imports. Verify that presets, rules, and the consumer guide load from their packaged locations. Correct missing files and references to checkout-only paths in the package source, then rebuild the archive.

- [ ] Trace changed release workflow behavior from `.projenrc.ts` through the generated workflow. Verify stable releases from `master` under npm's `latest` tag, prereleases from `dev` under the `dev` tag, and GitHub OIDC trusted publishing. Correct the workflow source and regenerate outputs that differ from those requirements.

### CLI and Effect services

- [ ] Trace changed file discovery, preset loading, source analysis, and diagnostic handling to the corresponding Effect service. Replace duplicated logic in `ProjectChecks` or `Biome` with that implementation and migrate affected consumers in the same batch. Replace separately constructed service graphs with the shared Layer graph so commands and tests receive the same service instance.

- [ ] Follow each changed service operation from its input to the result received by its caller. Compare its contracts with `BiomeInput`, `BiomeDiagnostic`, and the canonical preset and fixture contracts. Replace divergent local copies so the CLI and fixture runner use the same schemas and types.

- [ ] Inspect changed file discovery and diagnostic selection with the criteria supplied by their callers. Verify requested paths, preset selection, exclusions, and ordering. Correct filters or projections that discard those criteria or requested diagnostics.

- [ ] Trace each changed `Biome.lint` call through success, failure, and interruption. Repair paths that leave the WASM workspace or memory filesystem allocated. Compare CLI output with the original SDK diagnostics and native Biome behavior covered by `tests/runtime/`. Correct diagnostic conversion errors in the responsible service or consumer.

- [ ] Inspect changed service signatures and Effect Language Service findings. Repair the service composition that caused a finding. Remove widened Effect channels and casts introduced to hide it, and infer the channels from the corrected implementation.

## Shared review

### Coding standards

- [ ] Compare changed declaration names and composition patterns with committed implementations of the same behavior. Reuse the established names and patterns, and rename inconsistent terms throughout their consumers.

- [ ] Inspect imports in changed consumers. Replace forwarding imports with imports from the modules that declare the behavior. Delete the forwarding files retired by that change.

### Writing standards

- [ ] Review every changed comment, diagnostic, and document with the [documentation review checklist](review-docs.md). Follow the [fixture guide](rules-development.md#write-fixtures-as-learning-examples) for example comments and the [code documentation guide](code-documentation.md) for repository implementation comments.

### Test quality

- [ ] Compare each added test with existing coverage and identify the behavior gap it closes. Exercise the production rule, service, or command that implements that behavior. Assert the outcome received by its consumer. Rename Vitest labels to use `It catches ...` for invalid input and `It allows ...` for valid input.

- [ ] Trace each regression test through the real consumer affected by the defect. Await the production operation's completion through deterministic coordination. Correct assertions that run before the delivered result becomes available. Keep CLI behavior, WASM cleanup, and diagnostic parity tests in `tests/runtime/`.

- [ ] Inspect test assertions for reconstructed implementation logic or repeated library guarantees. Remove those checks with their dedicated setup. Preserve assertions that establish the rule or application's behavior.

### Operational quality

- [ ] Match validation evidence to the completed source revision. Retain passing results for unchanged work. Repeat a check when a repair invalidates its result or answers an identified question about the changed behavior.

- [ ] Select validation with the [commands appropriate to the changed files](../AGENTS.md#local-commands). Run `yarn test:update` for a completed rule or fixture batch; it includes lint, all tests, and typecheck. Check changed implementation code with scoped Biome and Effect diagnostics and the project typecheck. Confirm that the tools process the changed files, and repair findings in the responsible implementation before staging.

- [ ] Run `yarn build` for package or workflow changes. Compare the generated files and npm archive with the source changes that produced them. Correct missing package contents or unexpected generated changes before staging the batch.

- [ ] Review documentation-only changes for prose and working links. Run `git diff --check` and repair whitespace errors. Trace changed claims about software behavior through the implementation or existing validation evidence.

- [ ] Compare the final staged diff with the requested batch. Include its required consumers, fixtures, snapshots, and generated files. Correct omissions and accidental inclusions while preserving unrelated changes already in the index.
