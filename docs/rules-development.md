# Rules development

## Decide what the rule should change

For an existing rule, run its matcher against real Effect projects and inspect the findings. Trace a reported operation through its callers, inputs, dependencies, results, failures, and side effects. Use that investigation to select the task for the anonymized fixture pair. Before writing a new matcher, find an operation in those projects that demonstrates the proposed problem.

The author explains the problem through the investigated operation. The explanation identifies what the caller needs, which expression violates the proposed rule, and what the correction changes. This establishes a requirement against which findings can be judged. Without it, the matcher can report code merely because its syntax resembles an earlier finding.

The author then implements the correction with the installed dependencies and compares the two operations. If their results, failures, or effects differ, the author determines whether that difference fixes the reported defect or makes the correction unsuitable. A rule that enforces a convention must say so; working code must not be described as a runtime failure to justify a stylistic preference.

The same investigation identifies nearby forms the rule must allow. These include expressions that resemble the prohibited pattern but serve a different purpose. They provide counterexamples for matcher development, rather than leaving exceptions to be invented after registration.

## Write fixtures as learning examples

### Build the pair around that operation

The author turns the investigated task into independently written examples with generic names and invented data. The author writes new implementations that retain the syntax necessary to test the finding. An example with renamed identifiers still reproduces the source implementation if its code was copied. Published material must exclude identifying records, source-specific comments, and directions for locating nonpublic source.

The invalid example performs the task with the reported pattern. The valid example performs the same task with the correction. Both define the inputs, schemas, and dependencies needed to follow the operation. A dependency whose behavior determines the result cannot be replaced with an unexplained stub, because that would prevent the reviewer from checking whether the pair does the same work.

Review starts at the input and follows each operation through its returned value, failure paths, and effects. A syntactic correction must preserve those outcomes and effect order. When the rule fixes a behavioral defect, the explanation instead identifies the intended difference. This comparison is required because two files can compile and satisfy their lint expectations while demonstrating different tasks.

When rewriting an existing pair, the author also checks what its current cases protect. Syntax that previously exposed a false positive or missed finding must remain covered. A more readable replacement cannot discard that coverage simply because the old source was difficult to explain.

### Operation documentation

The author writes the main `/** ... */` comment for a reader who has not opened the other fixture. It names the operation, explains what it does for its caller, and introduces the requirements needed to understand the pattern. It then explains why the demonstrated implementation violates or satisfies the rule. The invalid and valid comments describe the same task, but explain the prohibited form and its correction respectively.

The explanation must distinguish conventions from behavioral defects. For example, when the rule selects one supported composition style over another, the comment explains that convention instead of inventing a failure in the prohibited code. This gives the reader an accurate reason to apply the correction.

### Inline comments

The author places a short comment beside the offending expression and another beside its correction. Each identifies the pattern directly in a complete sentence: "It incorrectly [verb] [pattern description]." or "It correctly [verb] [pattern description]." These markers let the reader locate the demonstrated forms without searching the whole operation.

The explanation remains in the main comment. "It correctly uses Match.value for conditional value selection." is a sufficient marker when that explanation is already present. A marker that explains the operation again duplicates the main comment. A marker that describes only the task does not identify the pattern.

During prose review, the reviewer reads the main explanation and its marker together, then assesses each against its own purpose. Apply [writing rule 3](unslop.md#content) to both comments: the main comment explains what the operation does and why, while the marker states what the adjacent code does incorrectly or correctly. Do not turn either into a gerund summary. The Humanizer skill and unslop guide do not justify a duplicate explanation in the marker or a marker that merely narrates the task.

### Code layout

The author separates logical steps with blank lines, including after multiline calls and before return statements. Related declarations stay together. This layout lets the reviewer follow the task in execution order while comparing the invalid expression with its correction.

### Fixture layout

The author updates the existing `invalid.ts` and `valid.ts` pair under `tests/specs/<group>/<rule>/`, using `.tsx` when JSX is needed. The group selects a preset that registers the rule, and the rule directory matches the production `.grit` filename. Snapshots remain beside their sources so reviewers can compare code and diagnostics together.

Additional cases belong in that pair and run through shared fixture discovery. Separate scenario directories, per-rule test files, and copied runner logic would give the same rule multiple test structures to maintain. Tests of CLI behavior or WASM resources instead belong in `tests/runtime/`, where they exercise those production operations.

Vitest labels describe the result with `It catches ...` or `It allows ...`. The rest of the label identifies the rejected pattern or permitted behavior. For example, "It catches unrelated diagnostics" names the observed result; "Checking diagnostics" does not. Test names and comments follow the same prose review as documentation.

## Implement and challenge the matcher

The author anchors the matcher on the expression that needs correction and limits context searches to the operation or AST node relevant to the requirement. Review must establish that unrelated declarations cannot change whether an expression is reported. The grammar references in `rules/js.ungram` and `rules/gritql.ungram` provide node names; when they need refreshing, `yarn refresh:biome-grammars --ref <biome-tag-or-commit>` selects the revision explicitly.

The main matcher precedes its supporting definitions so review begins with the reported pattern. Substantial exceptions use named patterns or predicates whose comments explain the allowed case and search limits. Grit documentation uses `//` comments because the supported parser rejects multiline block comments.

The diagnostic tells the developer why the matched expression needs to change and how to correct it. Conditions that affect the correction belong in that explanation. Mandatory changes use error severity; warning and informational diagnostics request review. The author checks the message against the reported span to establish that it points to the expression the reader should edit.

Before registration, the author tests the matcher alone against real source and the regression pair. The author compares unexpected findings with the requirement before accepting them. A false positive requires a matcher repair and retained valid coverage, rather than a suppression or an artificial rewrite of valid code.

## Run and review fixtures

### Check the pair in isolation and in combination

Run `yarn vitest run tests/specs.test.ts` during development, or `yarn test` for the full acceptance checks. Each fixture test checks its selected rule first, then requires the same diagnostics with every plugin from `configs/full.jsonc` and the shared built-in lint rules. Valid examples must have zero diagnostics; invalid examples may violate only their demonstrated rule. This comparison prevents a correction from teaching a pattern that conflicts with another rule.

These checks run without the fixture path overrides that disable ordinary repository linting. Warnings and informational diagnostics count, and parse errors, plugin-load failures, or skipped diagnostics fail the test. Repository lint and separate composition tests do not replace fixture acceptance.

The reviewer still compares messages, counts, severity, and locations with the intended correction. Agreement between the isolated and combined checks cannot establish that the selected rule reports the right expression.

### Check compilation and unresolved behavior

The author runs `yarn typecheck:fixtures` to establish that both examples compile against the installed dependencies. This check omits the Effect Language Service plugin because the examples deliberately contain lint violations. `yarn typecheck` includes it alongside the implementation typecheck.

If source review leaves a result or failure path uncertain, the author executes that path and compares the pair's behavior. Types and diagnostic snapshots cannot answer whether a correction changes returned data or effect order.

### Validate the finished batch

After completing a rule or fixture batch, the author runs `yarn test:update`. It formats source before updating snapshots, then runs lint, all tests, and typechecks. For formatting alone, use `yarn format`; `yarn test` checks formatting without applying changes.

The reviewer compares the finished source with the snapshot's complete original SDK result, including byte spans, messages, severity, tags, and advice. Unexplained differences are investigated before an update is accepted. The formatter can move the offending expression, so whitespace changes still require a span review.

A repair invalidates checks whose inputs it changes. Retain passing results for unchanged inputs. The author reruns the affected checks, verifies staged examples against staged rules, and completes [code review](code-review.md) before commit. This keeps validation tied to the reviewed change rather than to an earlier version of it.

## Verify preset and package use

After isolated validation, the author registers a new rule in its appropriate preset and `configs/full.jsonc`. Plugin paths use `./node_modules/@catenarycloud/linteffect/rules/` so consumer projects can resolve the published files. The author then runs `yarn projen` and reviews the generated `biome.local.jsonc` with the preset changes.

Configuration changes are checked through installed-project use and CLI use. The CLI check must exercise the command that loads packaged rule contents into the WASM filesystem. A checkout path check does not test that behavior. Package settings and generated tasks are changed through `.projenrc.ts`, regenerated, and verified with `yarn build` so the next regeneration preserves the change.

For affected valid code, the author compares checkout diagnostics through `yarn lint:local` with installed stable diagnostics through `yarn lint:dev`. Both accept paths and Biome flags. `BIOME_CONFIG_PATH=biome.local.jsonc` selects checkout rules throughout a test or build. A stable matcher bug is recorded through valid coverage and corrected in the responsible matcher. Preserve the valid example.

When changing matcher performance, the author measures against real source and reruns the accepted valid and invalid cases. Synthetic workloads do not establish performance on actual operations. Nonpublic inputs, paths, and measurements remain outside tracked files.
