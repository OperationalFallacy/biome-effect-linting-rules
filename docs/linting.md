# Fix lint diagnostics

Read the operation around a diagnostic before editing it. Preserve its result, error handling, and resource cleanup. These rules express package conventions; some diagnostics ask for review of otherwise valid code.

## Plan the rewrite

Read the repository's development guide and the relevant service contracts before you change the code. Use those contracts, established patterns, and the diagnostic's explanation to decide how the operation should work. A useful fix makes the operation easier to understand and preserves its behavior.

Work on one method at a time. Gather its inputs, make the decision explicit, and keep dependent steps in execution order. If the method covers several domain operations, split it into named service methods with clear responsibilities and result types. Each extracted method should perform a complete operation that its callers can understand from its contract.

Repeated warnings in a large method are a reason to review the method's structure. Moving the same steps into wrappers or changing syntax until lint accepts the code can leave the underlying problem intact. Choose the structure first, complete the rewrite, then use lint to check it.

## Composition and state

Keep related Effect steps in execution order in a pipeline or one `Effect.gen`. Sequence dependent effects with `Effect.flatMap` or `Effect.andThen`, and use `Effect.all` to collect results.

Use `Match.value`, `Option.match`, `Either.match`, or `Effect.if` for decisions, then continue the operation in one pipeline. Compute selected values before you construct an object from them. Keep callback blocks when local bindings or multiple steps improve readability.

Decode external data with Schema and use the decoded values in services. Define optional boolean defaults in the schema so each service reads the same meaning. Put the required validation in that decoder so its result is ready for the operation. Express absence with `Option`, failures with typed errors, and status choices with tagged unions.

Use `Record` operations inside `Struct.evolve` for state updates, and schema constructors to reconstruct models. Encode and decode data when reading or writing serialized values.

The web preset uses atoms for React state and subscriptions. Keep canonical state changes in Effect services, with atoms responsible for reads and commands. An atom action that reads state, copies it with object spread, and writes it back spreads a state transition across separate calls. Give that transition a service operation with an explicit result.

Keyed row atoms read keyed sources; list projections read collections. Provide dependencies on services or exported operations and reuse that runtime for their work.

## Related fields

When fields are valid only in particular combinations, describe each allowed combination as a complete schema member. Derive that schema from the authoritative facts and use its decoder wherever a caller needs to validate a candidate.

For example, suppose a document supports PDF and an image supports PNG:

```ts
import { Schema } from "effect";

const SupportedFile = Schema.Union(
  Schema.Struct({
    kind: Schema.Literal("document"),
    format: Schema.Literal("pdf"),
  }),
  Schema.Struct({
    kind: Schema.Literal("image"),
    format: Schema.Literal("png"),
  }),
);

const decodeSupportedFile = Schema.decodeUnknown(SupportedFile);
```

This schema accepts the two recorded combinations. Separate unions for `kind` and `format` would also admit an image with PDF or a document with PNG. The relation between the fields is part of the contract.

For a larger set of facts, generate one schema member for each allowed combination. The facts can come from a generator, a persisted decision, or a named domain type. Call the decoder with the candidate. The resulting Effect either returns a validated value or fails with a schema parse error.

Keep the relation's definition in one place so consumers use the same decoder. If the operation also classifies a domain outcome, expose that classification through a documented service method that returns the domain type. Keep that domain decision explicit in the service's public contract.

## Collection keys

Use `HashMap` or `HashSet` when a newly constructed, equal key must find an existing entry. Native `Map` and `Set` compare objects by reference and suit deliberate instance identity or scalar keys.

The warning checks explicit key types from local `Data.Class` declarations and `ReturnType` of local arrow functions returning `Data.struct`, `Data.tuple`, or `Data.array`. It supports renamed `Data` imports and namespace imports from `effect/Data`. It checks key definitions in the same file. Inferred keys and imported definitions remain outside its coverage.

## Vanilla Extract

For an empty style declaration, add the required styling or remove the declaration and its `className` use. Export each generated class under one name and update consumers to use it. Compose private base classes through `style`, `styleVariants`, or recipes.

## Verify changes

### Check the assigned files

Choose the lint scope from the task. For a file fix or feature change, check the edited files with the repository's Biome configuration:

```bash
npx @biomejs/biome lint <file>
```

Use the repository's lint task when it provides the same scope. In a monorepo, check which configuration applies to each workspace and run the command where it loads that configuration and its plugins.

For a directory cleanup or an assigned directory status check, run a summary for that directory:

```bash
npx @biomejs/biome lint <directory> --reporter=summary
```

Resolve the assigned files' diagnostics before another summary pass. Record unrelated diagnostics separately and keep the checks focused on the assigned files. Run formatting and import checks according to the repository's source-edit procedure.

For Markdown-only changes, review the document and its links. Skip Biome when it excludes those files.

### Check types and behavior

Run the repository's project typecheck after the rewrite. Use the project's compiler settings so tests, dependencies, and declaration output receive the checks expected by that workspace. A compiler command with individual source-file arguments can bypass those settings and produce misleading errors.

Use the repository's test policy to choose the relevant behavior checks. Finish when the edited files satisfy lint and project typechecks and the relevant tests confirm the operation's behavior. Report unrelated project failures separately, with enough detail to distinguish them from the edited files.

### Resolve exported declaration errors

For `TS4023` or `TS4020`, inspect the exported type. These errors mean TypeScript cannot name a type needed by an exported declaration.

Keep intermediate Effect and Layer assembly values local. Export stable services, layers, or constructors whose result types consumers can name. If a constructor needs an explicit contract, give it the domain result type, for example `Effect.succeed<Contract>(value)`.

Run the workspace's project typecheck with its declaration settings and inspect the affected files' diagnostics. Use the repository's clean-build procedure if stale compiler artifacts interfere. Preserve package metadata and other files that consumers need to resolve shared imports.

## Inspect Effect types and services

Use the editor language service or the repository's type inspection tool when you need the exact result, error, or dependency types of an Effect or Layer. For a large file, inspect its services, exported values, and local helpers before the rewrite. A source outline can show that structure; the TypeScript language service supplies the inferred types.

If the project has `@effect/language-service` installed, its CLI can report Effect diagnostics for a selected file:

```bash
npx --no-install effect-language-service diagnostics --file <absolute-file-path> --format text --severity error,warning
```

Run these commands from the workspace with that dependency. Use `overview` to inspect the file's exported services, errors, and layers:

```bash
npx --no-install effect-language-service overview --file <absolute-file-path> --max-symbol-depth 1
```

Use `layerinfo` to inspect what an exported layer provides and requires:

```bash
npx --no-install effect-language-service layerinfo --file <absolute-file-path> --name <exported-layer-name>
```

These commands help explain Effect diagnostics and layer composition. Complete the Biome and project typechecks as well.
