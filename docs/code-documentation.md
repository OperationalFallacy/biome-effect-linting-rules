# Code documentation

This guide applies only to this repository's implementation code, such as the CLI, Biome integration, and test runner. It does not apply to fixture examples in `tests/specs/` or composition examples in `tests/composition/`.

Explain what the documented entity lets its consumer do. Connect that purpose to the requirements the operation must meet and the behavior its implementation provides.

Write the explanation in complete sentences. Name the documented entity and state what it does before the conditions that qualify that action. Apply [writing rule 3](unslop.md#content) to every sentence in the comment, so gerund summaries and trailing explanations do not obscure who acts. Preserve API identifiers and established technical terms.

## Explain the documented entity

The first sentence identifies the documented entity and its kind, such as "the FixtureRunner service" or "the runFixture method."

An inline comment explains why a block of code is needed to fulfill the operation's requirements. Name the operation and connect the implementation to the behavior its consumer relies on. Each large body within a method needs this explanation beside it. Omit a statement-by-statement account that the reader can obtain from the code itself.

Write out the relationship that a noun chain leaves implicit. For example, replace "fixture rule loading" with "the repository loads the rule selected by the fixture's path."

## Explain what schemas validate

The comment for a schema explains what the application will do with the value and why that use requires validation. Relate the validation to the application's decision instead of repeating the fields and types in the declaration.

For example, the fixture path schema restricts filenames to valid or invalid TypeScript cases. Its comment explains how discovery uses those names to determine the expected lint result.

## Explain how callers use public methods

Public methods, exported functions, and helpers require comments that explain how callers use them. Describe how the operation uses the caller's input to perform its task, then explain how the caller should interpret the result and handle failure.

Explain how cancellation or interruption affects the work and what the caller needs to do to recover.

Review comments with the Humanizer skill and the [unslop guide](unslop.md).

## Rewrite comments around the documented capability

A comment such as "Validates diagnostics" omits what the caller supplies and what the method checks. Name the method and explain its contract:

```ts
/**
 * The runFixture method loads a fixture and its selected rule, checks the lint
 * result against the fixture's expected outcome, and returns the source and
 * original diagnostics for snapshot comparison. It fails if analysis is
 * incomplete or the diagnostics do not match the expected outcome.
 */
```

## Reject descriptive slogans

Replace claims such as "must remain usable" and "ensures seamless synchronization" with the operation and its result. For example, "Fixture discovery checks that each fixture's preset registers its selected rule."
