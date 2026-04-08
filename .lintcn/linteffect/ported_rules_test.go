package linteffect

import (
	"testing"

	"github.com/typescript-eslint/tsgolint/internal/rule_tester"
)

func TestNoModelOverlayCastRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoModelOverlayCastRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const source: unknown;
declare const untouched: string;
declare const noInitializer: string;
const exact = source as const;
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const source: unknown;
type User = { id: string };
const casted = source as User;
      `, "noModelOverlayCast"),
		},
	)
}

func TestNoEffectAllStepSequencingRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoEffectAllStepSequencingRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
declare const loadUser: any;
declare const loadOrg: any;
const ready = Effect.all([loadUser, loadOrg]);
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare const Ref: any;
declare const statusRef: any;
const refresh = Effect.all(
  [Ref.set(statusRef, "loading"), Effect.logDebug("refresh:start")],
  { concurrency: 1 },
);
      `, "noEffectAllStepSequencing"),
		},
	)
}

func TestNoEffectCallInEffectArgRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoEffectCallInEffectArgRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
declare const task: any;
const current = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare const task: any;
const tower = Effect.map(
  Effect.flatMap(task, (value: unknown) => value),
  (value: unknown) => value,
);
      `, "noEffectCallInEffectArg"),
		},
	)
}

func TestNoAtomRegistryEffectSyncRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoAtomRegistryEffectSyncRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
const logged = Effect.sync(() => console.log("safe"));
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare const Atom: any;
declare const atom: any;
const updated = Effect.sync(() => Atom.set(atom, 1));
      `, "noAtomRegistryEffectSync"),
		},
	)
}

func TestNoBranchInObjectRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoBranchInObjectRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const value: boolean;
const branchObject = { state: value };
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Option: any;
declare const flag: any;
const branchObject = {
  state: Option.match(flag, {
    onSome: (current: boolean) => current === true,
    onNone: () => false,
  }),
};
      `, "noBranchInObject"),
		},
	)
}

func TestNoRenderSideEffectsRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoRenderSideEffectsRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Match: any;
declare const flag: any;
const rendered = Match.value(flag).pipe(Match.when(true, () => 1));
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Match: any;
declare const Effect: any;
declare const flag: any;
const renderSideEffect = Match.value(flag).pipe(
  Match.when(true, () => Effect.succeed(1)),
);
      `, "noRenderSideEffects"),
		},
	)
}

func TestNoWrapgraphqlCatchallRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoWrapgraphqlCatchallRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
declare const request: any;
declare const query: any;
declare const applyResponse: any;
declare function pipe(value: any, ...ops: Array<any>): any;
declare function wrapGraphqlCall(value: any): any;
const graphql = pipe(
  request,
  wrapGraphqlCall(query),
  Effect.flatMap(applyResponse),
);
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare const request: any;
declare const query: any;
declare const applyResponse: any;
declare const handleGraphqlError: any;
declare function pipe(value: any, ...ops: Array<any>): any;
declare function wrapGraphqlCall(value: any): any;
const graphql = pipe(
  request,
  wrapGraphqlCall(query),
  Effect.flatMap(applyResponse),
  Effect.catchAll(handleGraphqlError),
);
      `, "noWrapgraphqlCatchall"),
		},
	)
}

func TestNoOptionBooleanNormalizationRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoOptionBooleanNormalizationRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Option: any;
declare const flag: any;
const normalized = Option.match(flag, {
  onSome: (current: boolean) => current,
  onNone: () => false,
});
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Option: any;
declare const flag: any;
const normalized = Option.match(flag, {
  onSome: (current: boolean) => current === true,
  onNone: () => false,
});
      `, "noOptionBooleanNormalization"),
		},
	)
}

func TestNoNestedEffectGenRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoNestedEffectGenRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
declare const task: any;
const single = Effect.gen(function* () {
  return yield* task;
});
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
const nested = Effect.gen(function* () {
  return yield* Effect.gen(function* () {
    return 1;
  });
});
      `, "noNestedEffectGen"),
		},
	)
}

func TestNoPipeLadderRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoPipeLadderRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare function pipe(value: any, ...ops: Array<any>): any;
declare const input: any;
const single = pipe(input, (current: any) => current);
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare function pipe(value: any, ...ops: Array<any>): any;
declare const input: any;
const nested = pipe(
  input,
  (current: any) => current,
  pipe(input, (current: any) => current),
);
      `, "noPipeLadder"),
		},
	)
}

func TestNoEffectSucceedVariableRule(t *testing.T) {
	runLintEffectRuleTester(t, &NoEffectSucceedVariableRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
declare const value: string;
declare function makeValue(): string;
const allowed = Effect.succeed(makeValue());
const alsoAllowed = Effect.succeed({ value });
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare const value: string;
const placeholder = Effect.succeed(value);
      `, "noEffectSucceedVariable"),
		},
	)
}

func TestWarnEffectSyncWrapperRule(t *testing.T) {
	runLintEffectRuleTester(t, &WarnEffectSyncWrapperRule,
		[]rule_tester.ValidTestCase{
			validCase(`
"effect";
declare const Effect: any;
const logged = Effect.sync(() => console.log("safe"));
      `),
		},
		[]rule_tester.InvalidTestCase{
			invalidCase(`
"effect";
declare const Effect: any;
declare function task(): void;
const wrapped = Effect.sync(() => task());
      `, "warnEffectSyncWrapper"),
		},
	)
}
