import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lintSourceWithRule, repoRoot } from "./ruleTestHarness";

type RuleCase = {
  rule: string;
  problem: string;
  alternative: string;
  invalid: string;
  valid: string;
  severity?: "error" | "warning" | "info";
  count?: number;
};

const cases: RuleCase[] = [
  {
    rule: "no-arrow-ladder",
    invalid: "const value = ((a) => ((b) => b)(a))(1);",
    valid: "const value = pipe(1, (n) => n + 1);",
    problem: "nested immediately invoked functions",
    alternative: "one value pipeline",
  },
  {
    rule: "no-atom-registry-effect-sync",
    invalid: "const value = Effect.sync(() => Atom.set(counterAtom, 1));",
    valid: "const value = Atom.set(counterAtom, 1);",
    problem: "a sync callback that returns an Atom Effect",
    alternative: "direct Atom Effect composition",
  },
  {
    rule: "no-branch-in-object",
    invalid:
      "const value = { count: Result.match(result, { onSuccess: (n) => n, onFailure: () => 0 }) };",
    valid:
      "const count = Result.match(result, { onSuccess: (n) => n, onFailure: () => 0 }); const value = { count };",
    problem: "Result decisions inside object fields",
    alternative: "a field decision before object construction",
  },
  {
    rule: "no-call-tower",
    invalid: "const value = Effect.map(Effect.succeed(1), (n) => n + 1);",
    valid: "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1));",
    problem: "nested data-first Effect calls",
    alternative: "Effect steps in a pipeline",
  },
  {
    rule: "no-effect-all-step-sequencing",
    invalid:
      "const value = Effect.all([Effect.log('start'), Effect.log('done')], { concurrency: 1 });",
    valid: "const value = Effect.all([Effect.succeed(1), Effect.succeed(2)]);",
    problem: "consecutive logs inside sequential Effect.all",
    alternative: "Effect.all for result collection",
  },
  {
    rule: "no-effect-as",
    invalid: "const value = Effect.void.pipe(Effect.as(1));",
    valid: "const value = Effect.void.pipe(Effect.map(() => 1));",
    problem: "Effect.as result replacement",
    alternative: "an explicit Effect.map result",
  },
  {
    rule: "no-effect-async",
    invalid: "const value = Effect.async((resume) => resume(Effect.succeed(1)));",
    valid: "const value = Effect.callback((resume) => resume(Effect.succeed(1)));",
    problem: "the removed Effect.async constructor",
    alternative: "Effect.callback registration",
  },
  {
    rule: "no-effect-bind",
    invalid: "const value = Effect.bind('count', () => Effect.succeed(1));",
    valid: "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1)));",
    problem: "an Effect.bind object accumulator",
    alternative: "direct dependent Effect steps",
  },
  {
    rule: "no-effect-do",
    invalid: "const value = Effect.Do;",
    valid: "const value = Effect.gen(function* () { return 1; });",
    problem: "the Effect.Do builder",
    alternative: "a generator operation",
  },
  {
    rule: "no-effect-ladder",
    invalid: "const value = Effect.map(Effect.map(Effect.succeed(1), (n) => n + 1), (n) => n * 2);",
    valid:
      "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1), Effect.map((n) => n * 2));",
    problem: "three nested data-first combinators",
    alternative: "three ordered pipeline steps",
  },
  {
    rule: "no-effect-never",
    invalid: "const value = Effect.never;",
    valid:
      "const value = Effect.acquireUseRelease(Effect.succeed(1), (n) => Effect.succeed(n), () => Effect.void);",
    problem: "an operation with no explicit lifetime",
    alternative: "an acquire-use-release lifetime",
  },
  {
    rule: "no-effect-orElse-ladder",
    invalid:
      "const value = Effect.catch(Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1))), () => Effect.succeed(0));",
    valid:
      "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1)), Effect.catch(() => Effect.succeed(0)));",
    problem: "recovery wrapped around a separate Effect sequence",
    alternative: "recovery at the end of the sequence",
  },
  {
    rule: "no-effect-side-effect-wrapper",
    invalid: "const value = Effect.as(Effect.log('saved'), 1);",
    valid: "const value = Effect.log('saved').pipe(Effect.andThen(() => Effect.succeed(1)));",
    problem: "a log with an implicit replacement result",
    alternative: "an explicit step after the log",
  },
  {
    rule: "no-effect-step-const-staging",
    invalid: "function load() { const staged = Effect.succeed(1); return staged; }",
    valid: "function makeApi() { const read = Effect.succeed(1); return { read }; }",
    problem: "an intermediate Effect constant returned alone",
    alternative: "a complete returned API operation",
  },
  {
    rule: "no-effect-succeed-variable",
    severity: "warning",
    invalid: "const value = Effect.succeed(current);",
    valid: "const value = Effect.succeed({ count: current });",
    problem: "an existing value wrapped in Effect.succeed",
    alternative: "a newly constructed result object",
  },
  {
    rule: "no-effect-sync-console",
    invalid: "const value = Effect.sync(() => console.log('saved'));",
    valid: "const value = Effect.log('saved');",
    problem: "console output inside Effect.sync",
    alternative: "Effect.log output",
  },
  {
    rule: "no-effect-type-alias",
    invalid: "type Load = Effect.Effect<number>;",
    valid: "function load(): Effect.Effect<number> { return Effect.succeed(1); }",
    problem: "a separate alias for an Effect contract",
    alternative: "an Effect contract on the function",
  },
  {
    rule: "no-effect-wrapper-alias",
    invalid: "const load = () => Effect.succeed(1);",
    valid: "const load = Effect.fn('load')(function* () { return 1; });",
    problem: "a function that only wraps an Effect constructor",
    alternative: "an operation defined with Effect.fn",
  },
  {
    rule: "no-empty-vanilla-extract-style",
    invalid: "const className = style({});",
    valid: "const className = style({ display: 'flex' });",
    problem: "an empty style declaration",
    alternative: "a style with a concrete declaration",
  },
  {
    rule: "no-family-collection-read",
    invalid: "const row = Atom.family((id) => Atom.make((get) => get(itemsCollectionAtom)));",
    valid: "const row = Atom.family((id) => Atom.make((get) => get(itemsByKeyAtom)));",
    problem: "a row atom that reads a collection",
    alternative: "a row atom that reads its keyed source",
  },
  {
    rule: "no-flatmap-ladder",
    severity: "warning",
    invalid:
      "const value = Effect.flatMap(Effect.succeed(1), (n) => Effect.flatMap(Effect.succeed(n), (m) => Effect.succeed(m)));",
    valid:
      "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n)), Effect.flatMap((m) => Effect.succeed(m)));",
    problem: "flatMap callbacks nested inside each other",
    alternative: "flatMap steps in one pipeline",
  },
  {
    rule: "no-fragmented-const-assembly",
    invalid: "const value = { ...makeFields(input), id: 1 };",
    valid: "const value = { id: 1, count: 2 };",
    problem: "an object assembled from helper fragments",
    alternative: "a complete object literal",
  },
  {
    rule: "no-fromnullable-nullish-coalesce",
    invalid: "const value = Option.fromNullishOr(input ?? null);",
    valid: "const value = Option.fromNullishOr(input);",
    problem: "a redundant nullish fallback before Option conversion",
    alternative: "direct Option.fromNullishOr conversion",
  },
  {
    rule: "no-if-statement",
    invalid: "function choose(flag) { if (flag) { return 1; } return 0; }",
    valid:
      "const choose = Effect.fn('choose')(function* (flag) { if (flag) { return 1; } return 0; });",
    problem: "an imperative decision outside an Effect body",
    alternative: "an ordinary decision inside Effect.fn",
  },
  {
    rule: "no-iife-wrapper",
    invalid: "const value = (() => 1)();",
    valid: "const value = pipe(1, (n) => n + 1);",
    problem: "an immediately invoked arrow wrapper",
    alternative: "a direct value pipeline",
  },
  {
    rule: "no-inline-runtime-provide",
    invalid:
      "const value = Effect.gen(function* () { return yield* task.pipe(Effect.provide(layer)); });",
    valid: "const value = Effect.runPromise(task.pipe(Effect.provide(layer)));",
    problem: "service layer construction inside an operation",
    alternative: "service layer assembly at the runner",
  },
  {
    rule: "no-manual-data-guard",
    invalid:
      "const isRow = (value: unknown): value is { id: string } => typeof value === 'object';",
    valid: "const decode = Schema.decodeUnknownEffect(Schema.Struct({ id: Schema.String }));",
    problem: "a handwritten guard for unknown object data",
    alternative: "Schema.decodeUnknownEffect validation",
  },
  {
    rule: "no-manual-effect-channels",
    invalid: "function load(): Effect.Effect<number> { return Effect.succeed(1); }",
    valid: "const load = Effect.fn('load')(function* () { return 1; });",
    problem: "a manual Effect return annotation",
    alternative: "inferred channels from Effect.fn",
  },
  {
    rule: "no-match-effect-branch",
    invalid:
      "const value = Match.value(1).pipe(Match.when(1, () => Effect.succeed(1).pipe(Effect.map((n) => n + 1))), Match.orElse(() => Effect.succeed(0)));",
    valid: "const value = Match.value(1).pipe(Match.when(1, () => 2), Match.orElse(() => 0));",
    problem: "a multi-step Effect sequence inside a Match case",
    alternative: "Match cases that select values",
  },
  {
    rule: "no-match-void-branch",
    invalid:
      "const value = Match.value(true).pipe(Match.when(true, () => Effect.void), Match.orElse(() => task));",
    valid:
      "const value = Match.value(true).pipe(Match.when(true, () => 1), Match.orElse(() => 0));",
    problem: "an empty Effect branch inside Match",
    alternative: "explicit domain choices in Match",
  },
  {
    rule: "no-model-overlay-cast",
    invalid: "const value = input as { id: string };",
    valid: "const value = Schema.decodeUnknownEffect(Schema.Struct({ id: Schema.String }))(input);",
    problem: "a model type assertion on input",
    alternative: "Schema validation of model input",
  },
  {
    rule: "no-naked-object-state-update",
    invalid: "const value = JSON.parse(input);",
    valid:
      "const value = Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Struct({ id: Schema.String })))(input);",
    problem: "raw JSON input without a schema",
    alternative: "JSON input through Schema.fromJsonString",
  },
  {
    rule: "no-nested-effect-call",
    invalid: "const value = Effect.map(Effect.map(Effect.succeed(1), (n) => n + 1), (n) => n * 2);",
    valid:
      "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1), Effect.map((n) => n * 2));",
    problem: "three Effect calls nested as arguments",
    alternative: "an ordered Effect pipeline",
  },
  {
    rule: "no-nested-effect-gen",
    invalid:
      "const value = Effect.gen(function* () { return yield* Effect.gen(function* () { return 1; }); });",
    valid: "const value = Effect.fn('load')(function* () { return 1; });",
    problem: "a generator fragment yielded inside another generator",
    alternative: "a complete Effect.fn operation",
  },
  {
    rule: "no-option-as",
    invalid: "const value = Option.as(Option.some(1), 2);",
    valid: "const value = Option.map(Option.some(1), () => 2);",
    problem: "Option.as result replacement",
    alternative: "an explicit Option.map result",
  },
  {
    rule: "no-option-boolean-normalization",
    invalid:
      "const value = Option.match(input, { onSome: (flag) => flag === true, onNone: () => false });",
    valid: "const value = Schema.decodeUnknownEffect(Schema.Boolean)(input);",
    problem: "a service-local optional boolean default",
    alternative: "a schema-defined boolean input",
  },
  {
    rule: "no-pipe-ladder",
    invalid: "const value = pipe(1, (n) => pipe(n, (m) => m + 1));",
    valid: "const value = pipe(1, (n) => n + 1, (n) => n * 2);",
    problem: "a pipe callback with another pipe",
    alternative: "one sequence of pipe transformations",
  },
  {
    rule: "no-pipeline-fragment-staging",
    invalid:
      "function load() { const staged = pipe(input, Option.fromNullishOr); return pipe(staged, Option.map((n) => n)); }",
    valid: "function load() { return pipe(input, Option.fromNullishOr, Option.map((n) => n)); }",
    problem: "a pipeline fragment before its returned continuation",
    alternative: "a complete returned pipeline",
  },
  {
    rule: "no-react-state",
    invalid: "const value = useState(0);",
    valid: "const value = useAtomValue(counterAtom);",
    problem: "React useState in an atom application",
    alternative: "an atom subscription",
  },
  {
    rule: "no-render-side-effects",
    invalid:
      "Match.value(1).pipe(Match.when(1, () => console.log('render')), Match.orElse(() => undefined));",
    valid:
      "const value = Match.value(1).pipe(Match.when(1, () => 'ready'), Match.orElse(() => 'waiting'));",
    problem: "a statement Match that runs a render log",
    alternative: "a Match expression that returns a value",
  },
  {
    rule: "no-return-in-arrow",
    severity: "info",
    invalid: "const value = [1].map((n) => { return n + 1; });",
    valid: "const value = [1].map((n) => n + 1);",
    problem: "an explicit return around a single transformation",
    alternative: "an expression arrow transformation",
  },
  {
    rule: "no-return-in-callback",
    severity: "info",
    invalid: "const value = [1].map(function increment(n) { return n + 1; });",
    valid: "const value = [1].map((n) => n + 1);",
    problem: "a function callback around a single result",
    alternative: "an expression callback",
  },
  {
    rule: "no-return-null",
    invalid: "function load() { return null; }",
    valid: "function load() { return Option.none(); }",
    problem: "a null absence sentinel",
    alternative: "Option.none for absence",
  },
  {
    rule: "no-runtime-runfork",
    invalid: "const value = Effect.gen(function* () { return Effect.runFork(Effect.void); });",
    valid: "const value = Effect.runFork(Effect.void);",
    problem: "an independent runtime fiber inside an operation",
    alternative: "an application entrypoint fiber",
  },
  {
    rule: "no-string-sentinel-const",
    invalid: "const status = 'ready';",
    valid: "const status = { _tag: 'Ready' };",
    problem: "a string status constant",
    alternative: "a tagged status value",
  },
  {
    rule: "no-string-sentinel-return",
    invalid: "const value = Effect.succeed('ready');",
    valid: "const value = Effect.succeed({ _tag: 'Ready' });",
    problem: "a string status through Effect.succeed",
    alternative: "a tagged outcome through Effect.succeed",
  },
  {
    rule: "no-switch-statement",
    invalid: "function choose(value) { switch (value) { case 1: return 1; default: return 0; } }",
    valid:
      "const choose = Effect.fn('choose')(function* (value) { switch (value) { case 1: return 1; default: return 0; } });",
    problem: "a switch outside an Effect body",
    alternative: "a switch inside Effect.fn",
  },
  {
    rule: "no-ternary",
    invalid: "const value = flag ? 1 : 0;",
    valid: "const value = Effect.suspend(() => Effect.succeed(flag ? 1 : 0));",
    problem: "a ternary outside an Effect body",
    alternative: "a decision inside Effect.suspend",
  },
  {
    rule: "no-try-catch",
    invalid: "function load() { try { return read(); } catch (error) { return recover(error); } }",
    valid:
      "const value = Effect.try({ try: read, catch: (cause) => cause }).pipe(Effect.catch(() => Effect.succeed(0)));",
    problem: "exception recovery outside Effect error channels",
    alternative: "Effect.try with typed recovery",
  },
  {
    rule: "no-unknown-boolean-coercion-helper",
    invalid:
      "const value = Match.value(input).pipe(Match.when((n) => typeof n === 'boolean', (n) => n), Match.orElse(() => null));",
    valid: "const value = Schema.decodeUnknownEffect(Schema.Boolean)(input);",
    problem: "a manual boolean guard with a null fallback",
    alternative: "Schema boolean validation",
  },
  {
    rule: "no-vanilla-extract-export-alias",
    invalid:
      "import { style } from '@vanilla-extract/css'; const base = style({ display: 'flex' }); export const alias = base;",
    valid:
      "import { style } from '@vanilla-extract/css'; export const base = style({ display: 'flex' });",
    problem: "a second export name for one generated style",
    alternative: "a single style export",
  },
  {
    rule: "prevent-dynamic-imports",
    invalid: "const value = import('./operation');",
    valid: "import { operation } from './operation'; const value = operation;",
    problem: "a dynamic module import",
    alternative: "a static module dependency",
  },
  {
    rule: "warn-effect-sync-wrapper",
    severity: "warning",
    invalid: "const value = Effect.sync(() => update());",
    valid: "const value = Effect.log('updated');",
    problem: "an opaque call inside Effect.sync",
    alternative: "an explicit Effect log operation",
  },
  {
    rule: "warn-native-collections",
    severity: "warning",
    invalid:
      "const key = (id: string) => ({ id }); const value = new Map<ReturnType<typeof key>, number>();",
    valid:
      "const key = (id: string) => ({ id }); const value = HashMap.empty<ReturnType<typeof key>, number>();",
    problem: "a native Map with structural object keys",
    alternative: "HashMap with structural object keys",
  },
];

const imports =
  'import { Effect, Option, Match, Result, Schema, Ref, Data, HashMap, pipe } from "effect";\n';

describe("Rule diagnostics", () => {
  it("It allows every packaged rule to have invalid and valid diagnostic cases", () => {
    const rules = fs.readdirSync(path.join(repoRoot, "rules"))
      .filter((file) => file.endsWith(".grit"))
      .map((file) => file.replace(/\.grit$/, ""))
      .sort();
    expect(cases.map(({ rule }) => rule).sort()).toEqual(rules);
  });

  for (const entry of cases) {
    it(`It catches ${entry.problem} (${entry.rule})`, () => {
      const result = lintSourceWithRule(entry.rule, imports + entry.invalid);
      const severity = entry.severity ?? "error";
      expect(result.status).toBe(severity === "error" ? 1 : 0);
      expect(result.diagnostics).toHaveLength(entry.count ?? 1);
      for (const diagnostic of result.diagnostics) {
        expect(diagnostic).toMatchObject({ category: "plugin", severity });
        expect(diagnostic.location.start.line).toBe(2);
      }
    });

    it(`It allows ${entry.alternative} (${entry.rule})`, () => {
      const result = lintSourceWithRule(entry.rule, imports + entry.valid);
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
