import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { lintSourceWithRule, repoRoot } from "./ruleTestHarness";

type RuleCase = {
  rule: string;
  invalid: string;
  valid: string;
  severity?: "error" | "warning" | "info";
  count?: number;
};

const cases: RuleCase[] = [
  { rule: "no-arrow-ladder", invalid: "const value = ((a) => ((b) => b)(a))(1);", valid: "const value = pipe(1, (n) => n + 1);" },
  { rule: "no-atom-registry-effect-sync", invalid: "const value = Effect.sync(() => Atom.set(counterAtom, 1));", valid: "const value = Atom.set(counterAtom, 1);" },
  { rule: "no-branch-in-object", invalid: "const value = { count: Result.match(result, { onSuccess: (n) => n, onFailure: () => 0 }) };", valid: "const count = Result.match(result, { onSuccess: (n) => n, onFailure: () => 0 }); const value = { count };" },
  { rule: "no-call-tower", invalid: "const value = Effect.map(Effect.succeed(1), (n) => n + 1);", valid: "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1));" },
  { rule: "no-effect-all-step-sequencing", invalid: "const value = Effect.all([Effect.log('start'), Effect.log('done')], { concurrency: 1 });", valid: "const value = Effect.all([Effect.succeed(1), Effect.succeed(2)]);" },
  { rule: "no-effect-as", invalid: "const value = Effect.void.pipe(Effect.as(1));", valid: "const value = Effect.void.pipe(Effect.map(() => 1));" },
  { rule: "no-effect-async", invalid: "const value = Effect.async((resume) => resume(Effect.succeed(1)));", valid: "const value = Effect.callback((resume) => resume(Effect.succeed(1)));" },
  { rule: "no-effect-bind", invalid: "const value = Effect.bind('count', () => Effect.succeed(1));", valid: "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1)));" },
  { rule: "no-effect-do", invalid: "const value = Effect.Do;", valid: "const value = Effect.gen(function* () { return 1; });" },
  { rule: "no-effect-ladder", invalid: "const value = Effect.map(Effect.map(Effect.succeed(1), (n) => n + 1), (n) => n * 2);", valid: "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1), Effect.map((n) => n * 2));" },
  { rule: "no-effect-never", invalid: "const value = Effect.never;", valid: "const value = Effect.acquireUseRelease(Effect.succeed(1), (n) => Effect.succeed(n), () => Effect.void);" },
  { rule: "no-effect-orElse-ladder", invalid: "const value = Effect.catch(Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1))), () => Effect.succeed(0));", valid: "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n + 1)), Effect.catch(() => Effect.succeed(0)));" },
  { rule: "no-effect-side-effect-wrapper", invalid: "const value = Effect.as(Effect.log('saved'), 1);", valid: "const value = Effect.log('saved').pipe(Effect.andThen(() => Effect.succeed(1)));" },
  { rule: "no-effect-step-const-staging", invalid: "function load() { const staged = Effect.succeed(1); return staged; }", valid: "function makeApi() { const read = Effect.succeed(1); return { read }; }" },
  { rule: "no-effect-succeed-variable", severity: "warning", invalid: "const value = Effect.succeed(current);", valid: "const value = Effect.succeed({ count: current });" },
  { rule: "no-effect-sync-console", invalid: "const value = Effect.sync(() => console.log('saved'));", valid: "const value = Effect.log('saved');" },
  { rule: "no-effect-type-alias", invalid: "type Load = Effect.Effect<number>;", valid: "function load(): Effect.Effect<number> { return Effect.succeed(1); }" },
  { rule: "no-effect-wrapper-alias", invalid: "const load = () => Effect.succeed(1);", valid: "const load = Effect.fn('load')(function* () { return 1; });" },
  { rule: "no-empty-vanilla-extract-style", invalid: "const className = style({});", valid: "const className = style({ display: 'flex' });" },
  { rule: "no-family-collection-read", invalid: "const row = Atom.family((id) => Atom.make((get) => get(itemsCollectionAtom)));", valid: "const row = Atom.family((id) => Atom.make((get) => get(itemsByKeyAtom)));" },
  { rule: "no-flatmap-ladder", severity: "warning", invalid: "const value = Effect.flatMap(Effect.succeed(1), (n) => Effect.flatMap(Effect.succeed(n), (m) => Effect.succeed(m)));", valid: "const value = Effect.succeed(1).pipe(Effect.flatMap((n) => Effect.succeed(n)), Effect.flatMap((m) => Effect.succeed(m)));" },
  { rule: "no-fragmented-const-assembly", invalid: "const value = { ...makeFields(input), id: 1 };", valid: "const value = { id: 1, count: 2 };" },
  { rule: "no-fromnullable-nullish-coalesce", invalid: "const value = Option.fromNullishOr(input ?? null);", valid: "const value = Option.fromNullishOr(input);" },
  { rule: "no-if-statement", invalid: "function choose(flag) { if (flag) { return 1; } return 0; }", valid: "const choose = Effect.fn('choose')(function* (flag) { if (flag) { return 1; } return 0; });" },
  { rule: "no-iife-wrapper", invalid: "const value = (() => 1)();", valid: "const value = pipe(1, (n) => n + 1);" },
  { rule: "no-inline-runtime-provide", invalid: "const value = Effect.gen(function* () { return yield* task.pipe(Effect.provide(layer)); });", valid: "const value = Effect.runPromise(task.pipe(Effect.provide(layer)));" },
  { rule: "no-manual-data-guard", invalid: "const isRow = (value: unknown): value is { id: string } => typeof value === 'object';", valid: "const decode = Schema.decodeUnknownEffect(Schema.Struct({ id: Schema.String }));" },
  { rule: "no-manual-effect-channels", invalid: "function load(): Effect.Effect<number> { return Effect.succeed(1); }", valid: "const load = Effect.fn('load')(function* () { return 1; });" },
  { rule: "no-match-effect-branch", invalid: "const value = Match.value(1).pipe(Match.when(1, () => Effect.succeed(1).pipe(Effect.map((n) => n + 1))), Match.orElse(() => Effect.succeed(0)));", valid: "const value = Match.value(1).pipe(Match.when(1, () => 2), Match.orElse(() => 0));" },
  { rule: "no-match-void-branch", invalid: "const value = Match.value(true).pipe(Match.when(true, () => Effect.void), Match.orElse(() => task));", valid: "const value = Match.value(true).pipe(Match.when(true, () => 1), Match.orElse(() => 0));" },
  { rule: "no-model-overlay-cast", invalid: "const value = input as { id: string };", valid: "const value = Schema.decodeUnknownEffect(Schema.Struct({ id: Schema.String }))(input);" },
  { rule: "no-naked-object-state-update", invalid: "const value = JSON.parse(input);", valid: "const value = Schema.decodeUnknownEffect(Schema.fromJsonString(Schema.Struct({ id: Schema.String })))(input);" },
  { rule: "no-nested-effect-call", invalid: "const value = Effect.map(Effect.map(Effect.succeed(1), (n) => n + 1), (n) => n * 2);", valid: "const value = Effect.succeed(1).pipe(Effect.map((n) => n + 1), Effect.map((n) => n * 2));" },
  { rule: "no-nested-effect-gen", invalid: "const value = Effect.gen(function* () { return yield* Effect.gen(function* () { return 1; }); });", valid: "const value = Effect.fn('load')(function* () { return 1; });" },
  { rule: "no-option-as", invalid: "const value = Option.as(Option.some(1), 2);", valid: "const value = Option.map(Option.some(1), () => 2);" },
  { rule: "no-option-boolean-normalization", invalid: "const value = Option.match(input, { onSome: (flag) => flag === true, onNone: () => false });", valid: "const value = Schema.decodeUnknownEffect(Schema.Boolean)(input);" },
  { rule: "no-pipe-ladder", invalid: "const value = pipe(1, (n) => pipe(n, (m) => m + 1));", valid: "const value = pipe(1, (n) => n + 1, (n) => n * 2);" },
  { rule: "no-pipeline-fragment-staging", invalid: "function load() { const staged = pipe(input, Option.fromNullishOr); return pipe(staged, Option.map((n) => n)); }", valid: "function load() { return pipe(input, Option.fromNullishOr, Option.map((n) => n)); }" },
  { rule: "no-react-state", invalid: "const value = useState(0);", valid: "const value = useAtomValue(counterAtom);" },
  { rule: "no-render-side-effects", invalid: "Match.value(1).pipe(Match.when(1, () => console.log('render')), Match.orElse(() => undefined));", valid: "const value = Match.value(1).pipe(Match.when(1, () => 'ready'), Match.orElse(() => 'waiting'));" },
  { rule: "no-return-in-arrow", severity: "info", invalid: "const value = [1].map((n) => { return n + 1; });", valid: "const value = [1].map((n) => n + 1);" },
  { rule: "no-return-in-callback", severity: "info", invalid: "const value = [1].map(function increment(n) { return n + 1; });", valid: "const value = [1].map((n) => n + 1);" },
  { rule: "no-return-null", invalid: "function load() { return null; }", valid: "function load() { return Option.none(); }" },
  { rule: "no-runtime-runfork", invalid: "const value = Effect.gen(function* () { return Effect.runFork(Effect.void); });", valid: "const value = Effect.runFork(Effect.void);" },
  { rule: "no-string-sentinel-const", invalid: "const status = 'ready';", valid: "const status = { _tag: 'Ready' };" },
  { rule: "no-string-sentinel-return", invalid: "const value = Effect.succeed('ready');", valid: "const value = Effect.succeed({ _tag: 'Ready' });" },
  { rule: "no-switch-statement", invalid: "function choose(value) { switch (value) { case 1: return 1; default: return 0; } }", valid: "const choose = Effect.fn('choose')(function* (value) { switch (value) { case 1: return 1; default: return 0; } });" },
  { rule: "no-ternary", invalid: "const value = flag ? 1 : 0;", valid: "const value = Effect.suspend(() => Effect.succeed(flag ? 1 : 0));" },
  { rule: "no-try-catch", invalid: "function load() { try { return read(); } catch (error) { return recover(error); } }", valid: "const value = Effect.try({ try: read, catch: (cause) => cause }).pipe(Effect.catch(() => Effect.succeed(0)));" },
  { rule: "no-unknown-boolean-coercion-helper", invalid: "const value = Match.value(input).pipe(Match.when((n) => typeof n === 'boolean', (n) => n), Match.orElse(() => null));", valid: "const value = Schema.decodeUnknownEffect(Schema.Boolean)(input);" },
  { rule: "no-vanilla-extract-export-alias", invalid: "import { style } from '@vanilla-extract/css'; const base = style({ display: 'flex' }); export const alias = base;", valid: "import { style } from '@vanilla-extract/css'; export const base = style({ display: 'flex' });" },
  { rule: "no-wrapgraphql-catchall", invalid: "const value = pipe(wrapGraphqlCall(input), Effect.catch(() => Effect.succeed(0)));", valid: "const value = wrapGraphqlCall(input).pipe(Effect.map(applyResponse));" },
  { rule: "prevent-dynamic-imports", invalid: "const value = import('./operation');", valid: "import { operation } from './operation'; const value = operation;" },
  { rule: "warn-effect-sync-wrapper", severity: "warning", invalid: "const value = Effect.sync(() => update());", valid: "const value = Effect.log('updated');" },
  { rule: "warn-native-collections", severity: "warning", invalid: "const key = (id: string) => ({ id }); const value = new Map<ReturnType<typeof key>, number>();", valid: "const key = (id: string) => ({ id }); const value = HashMap.empty<ReturnType<typeof key>, number>();" },
];

const imports = 'import { Effect, Option, Match, Result, Schema, Ref, Data, HashMap, pipe } from "effect";\n';

describe("Effect v4 rule compatibility", () => {
  it("It allows every packaged rule to have an explicit v4 behavior case", () => {
    const files = fs.readdirSync(path.join(repoRoot, "rules"))
      .filter((file) => file.endsWith(".grit"))
      .map((file) => file.replace(/\.grit$/, ""))
      .sort();
    expect(cases.map((entry) => entry.rule).sort()).toEqual(files);
  });

  for (const entry of cases) {
    it(`It catches the prohibited pattern for ${entry.rule}`, () => {
      const result = lintSourceWithRule(entry.rule, imports + entry.invalid);
      const severity = entry.severity ?? "error";
      expect(result.status).toBe(severity === "error" ? 1 : 0);
      expect(result.diagnostics).toHaveLength(entry.count ?? 1);
      for (const diagnostic of result.diagnostics) {
        expect(diagnostic).toMatchObject({ category: "plugin", severity });
        expect(diagnostic.location.start.line).toBe(2);
      }
    });

    it(`It allows the v4 alternative for ${entry.rule}`, () => {
      const result = lintSourceWithRule(entry.rule, imports + entry.valid);
      expect(result.status).toBe(0);
      expect(result.diagnostics).toEqual([]);
    });
  }
});
