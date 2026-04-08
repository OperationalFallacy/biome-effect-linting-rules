const bothTargets = ["oxlint", "lintcn"];

export const portedRules = [
  {
    name: "no-if-statement",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-if-statement.grit",
    message:
      "Rule: avoid imperative if branching. Why: it hides control flow in Effect code. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.",
    matcher: { kind: "if-statement" },
  },
  {
    name: "no-switch-statement",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-switch-statement.grit",
    message:
      "Rule: avoid imperative switch branching. Why: it hides control flow in Effect code and encourages case-by-case sequencing. Fix: use Match.value, Option.match, Either.match, or Effect.if, then run one explicit pipeline.",
    matcher: { kind: "switch-statement" },
  },
  {
    name: "no-ternary",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-ternary.grit",
    message:
      "Rule: avoid ternary expressions. Why: they hide control flow inside expressions. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.",
    matcher: { kind: "conditional-expression" },
  },
  {
    name: "no-return-null",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-return-null.grit",
    message:
      "Rule: avoid returning null. Why: null is a sentinel that forces defensive guards. Fix: use Option.none for absence or Effect.fail for errors.",
    matcher: { kind: "return-null" },
  },
  {
    name: "no-try-catch",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-try-catch.grit",
    message:
      "Rule: avoid try/catch in Effect files. Why: it bypasses Effect error channels and reintroduces imperative control flow. Fix: model failures in Effect and handle them with typed errors and Effect combinators.",
    matcher: { kind: "try-statement" },
  },
  {
    name: "prevent-dynamic-imports",
    targets: bothTargets,
    severity: "error",
    effectOnly: false,
    sourceRule: "rules/prevent-dynamic-imports.grit",
    message:
      "Rule: avoid dynamic module imports. Why: they hide dependencies and control flow behind deferred module loading, which makes code paths harder to read and verify. Fix: use static module imports so module dependencies stay explicit at the file boundary.",
    matcher: { kind: "dynamic-import" },
  },
  {
    name: "no-effect-async",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-async.grit",
    message:
      "Rule: avoid Effect.async. Why: callback-style wiring hides lifecycle and escapes declarative flow. Fix: use Stream or structured Effect lifecycles (acquire/use/release).",
    matcher: { kind: "member-call", objectName: "Effect", propertyName: "async" },
  },
  {
    name: "no-effect-bind",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-bind.grit",
    message:
      "Rule: avoid Effect.bind. Why: it hides sequencing inside builder-style accumulation. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.",
    matcher: { kind: "member-call", objectName: "Effect", propertyName: "bind" },
  },
  {
    name: "no-effect-do",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-do.grit",
    message:
      "Rule: avoid Effect.Do. Why: it pushes Effect code toward imperative builder choreography. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.",
    matcher: { kind: "member-access", objectName: "Effect", propertyName: "Do" },
  },
  {
    name: "no-effect-fn-generator",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-fn-generator.grit",
    message:
      "Rule: avoid Effect.fn generator wrappers. Why: they hide sequencing and dodge ladder rules. Fix: keep a single flat pipeline or use one Effect.gen.",
    matcher: { kind: "effect-fn-generator-call" },
  },
  {
    name: "no-effect-never",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-never.grit",
    message:
      "Rule: avoid Effect.never. Why: it hides lifecycle and leaks resources. Fix: use Stream or explicit acquire/release lifecycles with clear teardown.",
    matcher: { kind: "member-access", objectName: "Effect", propertyName: "never" },
  },
  {
    name: "no-effect-as",
    targets: bothTargets,
    severity: "error",
    effectOnly: false,
    sourceRule: "rules/no-effect-as.grit",
    message:
      "Rule: avoid Effect.as. Why: it hides sequencing and turns effects into placeholders. Fix: use Effect.map for value mapping or Effect.asVoid after explicit pipeline steps.",
    matcher: { kind: "member-call", objectName: "Effect", propertyName: "as" },
  },
  {
    name: "no-option-as",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-option-as.grit",
    message:
      "Rule: avoid Option.as. Why: it hides selection and encourages placeholder flows. Fix: use Option.map or Option.match and return the value explicitly.",
    matcher: { kind: "member-call", objectName: "Option", propertyName: "as" },
  },
  {
    name: "no-runtime-runfork",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-runtime-runfork.grit",
    message:
      "Rule: avoid Runtime.runFork. Why: it escapes structured concurrency. Fix: use forkScoped, Stream, or runtime-provided layers instead.",
    matcher: { kind: "member-call", objectName: "Runtime", propertyName: "runFork" },
  },
  {
    name: "no-react-state",
    targets: bothTargets,
    severity: "error",
    effectOnly: false,
    sourceRule: "rules/no-react-state.grit",
    message:
      "Rule: avoid React state hooks. Why: they bypass the atom runtime and break reactive flow. Fix: use @effect-atom/atom-react instead of useState/useReducer/useContext/useEffect/useCallback/useSyncExternalStore.",
    matcher: {
      kind: "react-hook-call",
      hookNames: [
        "useState",
        "useReducer",
        "useContext",
        "useCallback",
        "useEffect",
        "useSyncExternalStore",
      ],
    },
  },
  {
    name: "no-string-sentinel-return",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-string-sentinel-return.grit",
    message:
      "Rule: avoid returning string tokens. Why: it encodes control flow and forces defensive branching. Fix: return domain values (Option/Either/tagged unions) or real Effect results instead.",
    matcher: {
      kind: "member-call-string-arg",
      objectName: "Effect",
      propertyName: "succeed",
    },
  },
  {
    name: "no-string-sentinel-const",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-string-sentinel-const.grit",
    message:
      "Rule: avoid string status constants. Why: they encode control flow and force defensive branching. Fix: use tagged unions, Option/Either, or meaningful domain values instead of string tokens.",
    matcher: { kind: "const-string" },
  },
  {
    name: "no-manual-effect-channels",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-manual-effect-channels.grit",
    message:
      "Rule: avoid manual Effect channel tuples (`Effect.Effect<...>` / `Layer.Layer<...>`). Why: channels compose through the Effect pipeline and services; hand-written tuples desync from the real flow. Fix: drop the generic and let the return type infer from the Effect/Layer you return, or expose a service method that returns the effect directly.",
    matcher: {
      kind: "type-text-regex",
      nodeTypes: ["TSTypeReference"],
      pattern: "^(Effect\\.Effect|Layer\\.Layer)\\s*<",
    },
  },
  {
    name: "no-effect-type-alias",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-type-alias.grit",
    message:
      "Rule: avoid Effect.Effect type aliases. Why: they hide the service surface and make types opaque. Fix: keep Effect types on service methods or inline at the call site.",
    matcher: { kind: "type-alias-contains", substring: "Effect.Effect" },
  },
  {
    name: "no-model-overlay-cast",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-model-overlay-cast.grit",
    message:
      "Rule: avoid `as` assertions on decoded model flow. Why: assertions hide schema drift and allow untyped overlays. Fix: decode with the correct schema type and read fields directly.",
    matcher: { kind: "const-as-expression-non-const" },
  },
  {
    name: "no-fromnullable-nullish-coalesce",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-fromnullable-nullish-coalesce.grit",
    message:
      "Rule: avoid nullish re-wrap inside Option.fromNullable. Why: `x ?? null` and `x ?? undefined` add noise and hide source shape. Fix: pass the source directly to Option.fromNullable.",
    matcher: {
      kind: "member-call-arg-text-regex",
      objectName: "Option",
      propertyName: "fromNullable",
      pattern: "\\?\\?\\s*(null|undefined)\\s*$",
    },
  },
  {
    name: "no-effect-sync-console",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-sync-console.grit",
    message:
      "Rule: avoid console.* inside Effect.sync. Why: it hides side effects. Fix: replace with Effect.log* or remove the console call.",
    matcher: {
      kind: "member-call-text-regex",
      objectName: "Effect",
      propertyName: "sync",
      pattern: "\\bconsole\\.",
    },
  },
  {
    name: "no-atom-registry-effect-sync",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-atom-registry-effect-sync.grit",
    message:
      "Rule: do not wrap Atom/atomRegistry ops in Effect.sync. Why: it hides side effects and breaks atom flow. Fix: call Atom.get/Atom.set/Atom.update/Atom.modify/Atom.refresh directly.",
    matcher: {
      kind: "member-call-text-regex",
      objectName: "Effect",
      propertyName: "sync",
      pattern: "\\b(?:atomRegistry|Atom)\\.(?:get|set|update|modify|refresh)\\b",
    },
  },
  {
    name: "no-branch-in-object",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-branch-in-object.grit",
    message:
      "Rule: avoid Match/Option/Either inside object literals. Why: it hides the decision and invites workaround scaffolding. Fix: compute the value first (context), then build the object from named values with one flat decision.",
    matcher: {
      kind: "object-text-regex",
      pattern:
        ":\\s*(?:Match\\.value\\([\\s\\S]*?\\)\\.pipe\\(|Option\\.match\\(|Either\\.match\\()",
    },
  },
  {
    name: "no-call-tower",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-call-tower.grit",
    message:
      "Rule: avoid nested Effect call towers (Effect.fn(Effect.fn(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen for a single flat pipeline.",
    matcher: {
      kind: "nested-member-call-arg",
      objectName: "Effect",
    },
  },
  {
    name: "no-effect-all-step-sequencing",
    targets: bothTargets,
    severity: "error",
    effectOnly: false,
    sourceRule: "rules/no-effect-all-step-sequencing.grit",
    message:
      "Rule: avoid Effect.all for sequential side-effect steps. Why: it hides imperative sequencing in an array. Fix: use one explicit linear pipeline with Effect.andThen/flatMap and reserve Effect.all for real value aggregation.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "^\\s*Effect\\.all\\([\\s\\S]*(?:Ref\\.set|Atom\\.set|SubscriptionRef\\.set|Reactivity\\.invalidate|Fiber\\.interrupt|Effect\\.log[A-Za-z]*)[\\s\\S]*(?:concurrency\\s*:\\s*1|\\.pipe\\(\\s*Effect\\.asVoid\\s*\\))",
    },
  },
  {
    name: "no-effect-call-in-effect-arg",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-call-in-effect-arg.grit",
    message:
      "Rule: avoid Effect calls nested as arguments (Effect.xx(Effect.yy(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen to keep a single flat pipeline.",
    matcher: {
      kind: "nested-member-call-arg",
      objectName: "Effect",
    },
  },
  {
    name: "no-effect-orElse-ladder",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-orElse-ladder.grit",
    message:
      "Rule: avoid Effect.orElse around sequencing chains. Why: it hides error handling and splits the flow. Fix: move error handling to a single terminal decision after the pipeline.",
    matcher: {
      kind: "member-call-text-regex",
      objectName: "Effect",
      propertyName: "orElse",
      pattern: "Effect\\.(?:flatMap|zipRight|as|tap)\\(",
    },
  },
  {
    name: "no-effect-succeed-variable",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/no-effect-succeed-variable.grit",
    message:
      "Rule: avoid Effect.succeed(variable) as a branch placeholder. Why: it hides a decision and turns data into pseudo-control flow. Fix: select a plain value (Option/Match) and then run one Effect pipeline after the decision; if you already read the state, return it as a value. Avoid Option.toArray/forEach hacks that just re-encode the branch.",
    matcher: { kind: "effect-succeed-simple-value" },
  },
  {
    name: "no-flatmap-ladder",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/no-flatmap-ladder.grit",
    message:
      "Rule: avoid nested Effect.flatMap or map+flatten ladders. Why: they hide sequencing and push laddered control flow. Fix: build context once (Effect.all/Effect.map) and run a single flatMap.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "^\\s*Effect\\.(?:flatMap\\([\\s\\S]*Effect\\.flatMap\\(|flatten\\([\\s\\S]*Effect\\.map\\()",
    },
  },
  {
    name: "no-iife-wrapper",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-iife-wrapper.grit",
    message:
      "Rule: avoid immediate invocation of inline functions. Why: it hides decisions and sequencing. Fix: bind a named context with const and keep one Match/Option decision in a flat pipeline.",
    matcher: { kind: "iife-call" },
  },
  {
    name: "no-match-void-branch",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-match-void-branch.grit",
    message:
      "Rule: avoid void Match branches. Why: they hide guard-style control flow. Fix: remove the no-op branch or select a value and run one Effect pipeline outside the Match.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "^\\s*Match\\.(?:when\\s*\\(\\s*(?:true|false)\\s*,\\s*\\(\\)\\s*=>\\s*Effect\\.void|orElse\\s*\\(\\s*\\(\\)\\s*=>\\s*Effect\\.void)",
    },
  },
  {
    name: "no-nested-effect-gen",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-nested-effect-gen.grit",
    message:
      "Rule: avoid nested Effect.gen. Why: nested generators hide sequencing. Fix: flatten to a single Effect.gen per method or a single flat pipeline.",
    matcher: {
      kind: "call-text-regex",
      pattern: "^\\s*Effect\\.gen\\([\\s\\S]*\\bEffect\\.gen\\(",
    },
  },
  {
    name: "no-option-boolean-normalization",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-option-boolean-normalization.grit",
    message:
      "Rule: avoid repeated Option boolean normalization (`onSome: value === true, onNone: false`). Why: it scatters coercion rules across services. Fix: normalize once at schema boundary and read booleans directly.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "^\\s*Option\\.match\\([\\s\\S]*onSome\\s*:\\s*\\([^)]*\\)\\s*=>\\s*[A-Za-z_$][\\w$]*\\s*===\\s*true[\\s\\S]*onNone\\s*:\\s*\\(\\)\\s*=>\\s*false",
    },
  },
  {
    name: "no-pipe-ladder",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-pipe-ladder.grit",
    message:
      "Rule: avoid nested pipe() chains. Why: they hide sequencing. Fix: refactor into one flat pipeline with a single decision point.",
    matcher: { kind: "pipe-call-has-nested-pipe" },
  },
  {
    name: "no-arrow-ladder",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-arrow-ladder.grit",
    message:
      "Rule: avoid nested IIFEs. Why: they hide sequencing and push wrapper hacks. Fix: bind a named context with const and keep one flat pipeline with a single Match/Option decision.",
    matcher: { kind: "nested-arrow-iife" },
  },
  {
    name: "no-effect-ladder",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-ladder.grit",
    message:
      "Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.",
    matcher: { kind: "effect-ladder" },
  },
  {
    name: "no-effect-side-effect-wrapper",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-side-effect-wrapper.grit",
    message:
      "Rule: avoid Effect.as/Effect.zipRight for side effects. Why: they hide side effects and discard intent. Fix: use explicit pipeline steps that return real values (Effect.flatMap/andThen/tap).",
    matcher: { kind: "effect-side-effect-wrapper" },
  },
  {
    name: "no-effect-wrapper-alias",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-effect-wrapper-alias.grit",
    message:
      "Rule: avoid Effect wrapper aliases. Why: they create wrapper choreography and bloat local helpers. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.",
    matcher: { kind: "effect-wrapper-alias" },
  },
  {
    name: "no-inline-runtime-provide",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-inline-runtime-provide.grit",
    message:
      "Rule: do not inline runtime provisioning inside local helper Effect code. Why: inline provide chains hide dependency assembly instead of owning it at a service or exported boundary. Fix: provide the dependency once at the owning boundary, then yield the runtime or service directly.",
    matcher: { kind: "inline-runtime-provide" },
  },
  {
    name: "no-match-effect-branch",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/no-match-effect-branch.grit",
    message:
      "Rule: avoid multi-step sequencing inside Match or Option branches. Why: it hides control flow. Fix: select a value in Match/Option first, then run one Effect pipeline outside the branch.",
    matcher: { kind: "match-effect-branch" },
  },
  {
    name: "no-nested-effect-call",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-nested-effect-call.grit",
    message:
      "Rule: avoid deeply nested Effect calls (Effect.xx(Effect.yy(Effect.zz(...)))). Why: they hide sequencing and spread flow. Fix: build values first, then run one flat Effect pipeline.",
    matcher: { kind: "deep-effect-call" },
  },
  {
    name: "no-return-in-arrow",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/no-return-in-arrow.grit",
    message:
      "Rule: avoid block-bodied arrow callbacks with returns. Why: they hide local control flow. Fix: use expression-only callbacks and move the logic into a single pipeline (pipe/Match/Option/A.map).",
    matcher: { kind: "return-in-arrow-callback" },
  },
  {
    name: "no-return-in-callback",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/no-return-in-callback.grit",
    message:
      "Rule: avoid returns inside inline callbacks. Why: they hide control flow. Prefer expression-only callbacks, but leaf-level Effect branches with local bindings may use returns when needed.",
    matcher: { kind: "return-in-function-callback" },
  },
  {
    name: "no-unknown-boolean-coercion-helper",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-unknown-boolean-coercion-helper.grit",
    message:
      "Rule: avoid local unknown-to-boolean coercion helpers in services. Why: runtime coercion belongs at schema boundary, not in service flow. Fix: decode boolean optionality in schema and read typed booleans in the Effect pipeline.",
    matcher: { kind: "unknown-boolean-coercion-helper" },
  },
  {
    name: "no-render-side-effects",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-render-side-effects.grit",
    message:
      "Rule: avoid Match.value(...).pipe(...) as a statement. Why: it runs side effects during render. Fix: move the side effect into an Effect runtime action or event handler, and keep Match as a pure expression.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "^\\s*Match\\.value\\([\\s\\S]*\\.pipe\\([\\s\\S]*Match\\.(?:when|orElse)\\([\\s\\S]*=>\\s*(?:void\\s+)?Effect\\.",
    },
  },
  {
    name: "no-wrapgraphql-catchall",
    targets: bothTargets,
    severity: "error",
    effectOnly: true,
    sourceRule: "rules/no-wrapgraphql-catchall.grit",
    message:
      "Rule: avoid catchAll after wrapGraphqlCall/applyResponse. Why: the envelope already surfaces structured errors. Fix: handle errors in the response mapping instead of catchAll.",
    matcher: {
      kind: "call-text-regex",
      pattern:
        "(?:wrapGraphqlCall\\(|Effect\\.flatMap\\(applyResponse\\))[\\s\\S]*Effect\\.catchAll\\(",
    },
  },
  {
    name: "warn-effect-sync-wrapper",
    targets: bothTargets,
    severity: "warn",
    effectOnly: true,
    sourceRule: "rules/warn-effect-sync-wrapper.grit",
    message:
      "Rule: avoid Effect.sync around side effects. Why: it hides intent. Fix: use Effect.log* or an explicit pipeline step for the side effect.",
    matcher: { kind: "effect-sync-side-effect-wrapper" },
  },
];

export const oxlintRules = portedRules.filter((definition) =>
  definition.targets.includes("oxlint"),
);

export const lintcnRules = portedRules.filter((definition) =>
  definition.targets.includes("lintcn"),
);
