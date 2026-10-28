# Fix lint diagnostics

Read the operation around a diagnostic before you edit it. Preserve its result, error propagation and recovery, and resource cleanup. These rules express package conventions; some diagnostics ask for review of otherwise valid code.

## Plan the rewrite

Read the repository's development guide and the relevant service contracts before you change the code. Use those contracts, established patterns, and the diagnostic's explanation to decide how the operation should work. A useful fix makes the operation easier to understand and preserves its behavior.

Work on one method at a time. Gather its inputs, make the decision explicit, and keep dependent steps in execution order. If the method covers several domain operations, split it into named service methods with clear responsibilities and result types. Each extracted method should perform a complete operation that its callers can understand from its contract.

Repeated diagnostics in a large method call for a review of its structure. A wrapper around the same steps leaves the original problem intact. The same applies to syntax changes whose sole purpose is to satisfy lint. Choose the structure first, complete the rewrite, then use lint to check it.

## Composition and state

Keep related Effect steps in execution order in a pipeline or one `Effect.gen`. Sequence dependent effects with `Effect.flatMap` or `Effect.andThen`, and use `Effect.all` to collect results.

Define complete service operations, then return them through the service API, for example `return { readCount, resetCount }`. Reusable Effect values, pipelines, and functions built with `Effect.fn` or `Effect.fnUntraced` are valid API members. Keep their inferred result, error, and dependency types. Inline intermediate Effect constants inside each operation so its sequence stays together. The rule still checks intermediate steps inside each API operation.

The `no-effect-step-const-staging` rule recognizes declarations exposed as direct members of an object returned by the same function. It supports shorthand members and explicit property names. Returns in nested functions, nested objects, and separate blocks do not establish that relationship. Keep intermediate fragments inside their operation. The service API must expose complete operations; extra API members must serve a purpose beyond suppression of a diagnostic.

See the [service operation examples](service-effect-operations.md) for allowed API members and intermediate steps that still require changes.

Use ordinary control flow inside `Effect.gen`, `Effect.fn`, or `Effect.fnUntraced` to express decisions in execution order. Use `Match.value`, `Option.match`, or `Result.match` for decisions outside those operations. Compute selected values before you construct an object from them. Keep callback blocks when local bindings or multiple steps improve readability.

Decode external data with Schema and use the decoded values in services. Define optional boolean defaults in the schema so each service applies the same policy. Put the required validation in that decoder so its result is ready for the operation. Express absence with `Option`, failures with typed errors, and status choices with tagged unions.

Use `Record` operations inside `Struct.evolve` for state updates. Reconstruct validated models with their schema constructors, such as `Model.make`. Decode serialized input with `Schema.decodeUnknownEffect` and encode output with `Schema.encodeEffect`. Apply `Schema.fromJsonString` to the model schema for JSON input and output.

The web preset uses atoms for React state and subscriptions. Keep canonical state changes in Effect services, with atoms responsible for reads and commands. An atom action that reads state, copies it with object spread, and writes it back spreads a state transition across separate calls. Give that transition a service operation with an explicit result.

The `Atom` operations `get`, `set`, `update`, `modify`, and `refresh` return Effects. Yield them or compose them directly. Registry instance methods, such as `registry.get` and `registry.set`, execute synchronously. Keep `Effect.sync` around those methods when an Effect must defer their execution.

Keyed row atoms read keyed sources; list projections read collections. Provide dependencies on services or exported operations and reuse that runtime for their work.

## Related fields

When fields are valid only in particular combinations, describe each allowed combination as a complete schema member. Derive that schema from the authoritative facts and use its decoder wherever a caller needs to validate a candidate.

For example, suppose a document supports PDF and an image supports PNG:

```ts
import { Schema } from "effect";

const SupportedFile = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("document"),
    format: Schema.Literal("pdf"),
  }),
  Schema.Struct({
    kind: Schema.Literal("image"),
    format: Schema.Literal("png"),
  }),
]);

const decodeSupportedFile = Schema.decodeUnknownEffect(SupportedFile);
```

This schema accepts the two recorded combinations. Separate unions for `kind` and `format` would also admit an image with PDF or a document with PNG. The relation between the fields is part of the contract.

For a larger set of facts, generate one schema member for each allowed combination. The facts can come from a generator, a persisted decision, or a named domain type. Call the decoder with the candidate. The decoder's Effect either returns a validated value or fails with a schema parse error.

Keep the relation's definition in one place so consumers use the same decoder. If the operation also classifies a domain outcome, expose that classification through a documented service method that returns the domain type. Keep that domain decision explicit in the service's public contract.

## Collection keys

Use `HashMap` or `HashSet` for lookups that must find a stored entry through a newly constructed, equal key. Native `Map` and `Set` compare objects by reference and suit deliberate instance identity or scalar keys.

Effect compares ordinary objects and arrays structurally through its equality APIs. The warning checks explicit object, tuple, and array key types, local `Data.Class` declarations, and `ReturnType` of local factories that return objects or arrays. It supports renamed `Data` imports and namespace imports from `effect/Data`. It checks key definitions in the same file. Inferred keys and imported definitions remain outside its coverage. Use `Equal.byReference` for values whose identity must distinguish otherwise equal instances.

## Vanilla Extract

For an empty style declaration, add the required styles or remove the declaration and its `className` use. Export each generated class under one name and update consumers to use it. Compose private base classes through `style`, `styleVariants`, or recipes.

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

Resolve the assigned files' diagnostics before another summary pass. Record unrelated diagnostics separately and keep the checks focused on the assigned files. Follow the repository's source-edit procedure for the formatter and import checks.

For Markdown-only changes, review the document and its links. Skip Biome when it excludes those files.

### Check types and behavior

Run the repository's project typecheck after the rewrite. Use the project's compiler configuration so it checks the workspace's tests, dependencies, and declaration output. A compiler command with individual source-file arguments can bypass that configuration and report errors unrelated to the workspace's checks.

Use the repository's test policy to choose the relevant behavior checks. Finish when the edited files satisfy lint and project typechecks and the relevant tests confirm the operation's behavior. Report unrelated project failures separately, with enough detail to distinguish them from the edited files.

### Resolve exported declaration errors

For `TS4023` or `TS4020`, inspect the exported type. These errors mean TypeScript cannot name a type needed by an exported declaration.

Keep intermediate Effect and Layer assembly values local. Export stable services, layers, or constructors whose result types consumers can name. If a constructor needs an explicit contract, give it the domain result type, for example `Effect.succeed<Contract>(value)`.

Run the workspace's project typecheck with its declaration configuration and inspect the affected files' diagnostics. Use the repository's clean-build procedure if stale compiler artifacts interfere. Preserve package metadata and other files that consumers need to resolve shared imports.

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
