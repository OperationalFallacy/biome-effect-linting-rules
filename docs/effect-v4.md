# Effect v4 migration

This release targets Effect 4. Version 0.0.9 is the final Effect v3 release.

## Rule changes

Define reusable operations with `Effect.fn` or `Effect.fnUntraced`. The package no longer includes `no-effect-fn-generator`. Ordinary decisions inside generators, function constructors, and `Effect.suspend` bodies remain valid. Value pipelines outside those bodies use `Match`, `Option`, or `Result`.

Complete operations can appear as direct members of a service's returned API. Intermediate Effect constants, wrappers, and nested generators inside those operations still require changes. The wrapper and nested-generator checks now apply the same API exception as the step-constant rule. `Context.Service` requires an explicit public contract, so the manual-channel rule allows its contract types.

Assemble dependencies with `Layer.effect` and `Layer.provide`. Keep the application's final `Effect.provide` beside its runner. A service operation must yield its dependencies rather than rebuild the service graph. Dynamic contextual injection through `Effect.provideService` remains valid.

Reserve `Effect.runFork` and `Effect.runForkWith` for application startup and external integrations. Use `Effect.forkChild` or `Effect.forkScoped` inside operations so cancellation and cleanup follow the parent fiber or scope.

Import `Atom` and `AsyncResult` from `effect/reactivity`. React hooks come from `@effect/atom-react`. Use `AsyncResult` for asynchronous atom state, including its initial state. `Result` from `effect` represents a completed success or failure.

The atom rule distinguishes effectful `Atom` operations from synchronous registry instance methods. Yield or compose `Atom.get`, `Atom.set`, `Atom.update`, `Atom.modify`, and `Atom.refresh` directly. Keep `Effect.sync` around registry instance calls that need deferred execution.

Use `HashMap` or `HashSet` for structural object and array keys. The collection warning recognizes plain objects and arrays. Native collections remain appropriate for deliberate instance identity and scalar keys.

The full preset now includes every rule from the smaller presets, including `no-inline-runtime-provide`. The root configuration matches the full preset. The existing `no-effect-succeed-variable` review rule remains opt-in.

## API guidance

The diagnostics and consumer guide use these APIs:

| Previous API | Effect v4 API |
| --- | --- |
| `Effect.async` | `Effect.callback`, with a cleanup Effect |
| `Either.match` | `Result.match` |
| `Effect.catchAll`, `Effect.orElse` | `Effect.catch` |
| `Effect.zipRight` | `Effect.andThen` |
| `Option.fromNullable` | `Option.fromNullishOr` |
| `Effect.Service`, `Context.Tag` | `Context.Service` with explicit layers |
| `Schema.decodeUnknown` | `Schema.decodeUnknownEffect` |
| `Schema.Union(a, b)` | `Schema.Union([a, b])` |
| `Data.struct`, `Data.tuple`, `Data.array` | Ordinary objects and arrays |

Use the model schema's `.make` method to construct validated values. The module-level `Schema.make` constructs a schema from an AST. Decode JSON through `Schema.fromJsonString` and `Schema.decodeUnknownEffect`; encode it through `Schema.encodeEffect`.

Historical rule filenames such as `no-effect-orElse-ladder` and `no-fromnullable-nullish-coalesce` remain stable for existing plugin registrations. Their matchers and diagnostics use the current APIs.

The project-specific GraphQL recovery rule has been removed. Remove its entry from custom plugin lists. GraphQL recovery policies belong in application-specific rules.

## Validation and limits

Every packaged rule has an invalid case and a nearby valid alternative. Runtime contract tests check structural equality, schema JSON codecs, service layers, and atom execution against the pinned Effect version. Focused regressions cover service API scope, nested fragments, call arity, atom operations, and import syntax.

These Grit rules inspect syntax within one file. They do not resolve imported aliases or infer types. Repository typechecks and behavior tests still determine whether a rewrite preserves the operation's contract. The [consumer guide](linting.md) describes that process.
