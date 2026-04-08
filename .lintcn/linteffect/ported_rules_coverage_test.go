package linteffect

import (
	"testing"

	"github.com/typescript-eslint/tsgolint/internal/rule"
	"github.com/typescript-eslint/tsgolint/internal/rule_tester"
)

func TestExistingTranslatedRuleCoverage(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name    string
		rule    *rule.Rule
		valid   []rule_tester.ValidTestCase
		invalid []rule_tester.InvalidTestCase
	}{
		{
			name: "no-if-statement",
			rule: &NoIfStatementRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const ready = true;
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const ready: boolean;
if (ready) {
  console.log("ready");
}
        `, "no-if-statement"),
			},
		},
		{
			name: "no-switch-statement",
			rule: &NoSwitchStatementRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const ready = "open";
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const status: string;
switch (status) {
  case "open":
    break;
}
        `, "no-switch-statement"),
			},
		},
		{
			name: "no-ternary",
			rule: &NoTernaryRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const ready = true;
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const ready: boolean;
const value = ready ? "yes" : "no";
        `, "no-ternary"),
			},
		},
		{
			name: "no-return-null",
			rule: &NoReturnNullRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
function load(): string {
  return "ok";
}
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
function load(): null {
  return null;
}
        `, "no-return-null"),
			},
		},
		{
			name: "no-try-catch",
			rule: &NoTryCatchRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.succeed(1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
try {
  console.log("side effect");
} catch (error) {
  console.error(error);
}
        `, "no-try-catch"),
			},
		},
		{
			name: "prevent-dynamic-imports",
			rule: &PreventDynamicImportsRule,
			valid: []rule_tester.ValidTestCase{
				{
					Code: `import { value } from "./dep"; const next = value;`,
					Files: map[string]string{
						"dep.ts": `export const value = 1;`,
					},
				},
			},
			invalid: []rule_tester.InvalidTestCase{
				{
					Code: `
async function load() {
  return import("./dep");
}
          `,
					Files: map[string]string{
						"dep.ts": `export const value = 1;`,
					},
					Errors: []rule_tester.InvalidTestCaseError{
						{MessageId: toRuleMessageID("prevent-dynamic-imports")},
					},
				},
			},
		},
		{
			name: "no-effect-async",
			rule: &NoEffectAsyncRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.sync(() => 1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.async(() => {});
        `, "no-effect-async"),
			},
		},
		{
			name: "no-effect-bind",
			rule: &NoEffectBindRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const base: any;
declare const getUser: any;
const load = Effect.bind(base, "user", () => getUser);
        `, "no-effect-bind"),
			},
		},
		{
			name: "no-effect-do",
			rule: &NoEffectDoRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.succeed(1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.Do;
        `, "no-effect-do"),
			},
		},
		{
			name: "no-effect-fn-generator",
			rule: &NoEffectFnGeneratorRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.fn((value: string) => Effect.succeed(value));
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
const load = Effect.fn(function* () {
  return yield* task;
});
        `, "no-effect-fn-generator"),
			},
		},
		{
			name: "no-effect-never",
			rule: &NoEffectNeverRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.void;
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const waitForever = Effect.never;
        `, "no-effect-never"),
			},
		},
		{
			name: "no-effect-as",
			rule: &NoEffectAsRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.map(task, () => 1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
const load = Effect.as(task, 1);
        `, "no-effect-as"),
			},
		},
		{
			name: "no-option-as",
			rule: &NoOptionAsRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const value: any;
const load = Option.map(value, () => 1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const value: any;
const load = Option.as(value, 1);
        `, "no-option-as"),
			},
		},
		{
			name: "no-runtime-runfork",
			rule: &NoRuntimeRunforkRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const fiber = Effect.fork(task);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
const fiber = Runtime.runFork(task);
        `, "no-runtime-runfork"),
			},
		},
		{
			name: "no-react-state",
			rule: &NoReactStateRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
declare function useAtomValue<T>(atom: T): T;
declare const counterAtom: number;
const value = useAtomValue(counterAtom);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
declare function useState<T>(value: T): [T, (next: T) => void];
const [value, setValue] = useState(0);
        `, "no-react-state"),
			},
		},
		{
			name: "no-string-sentinel-return",
			rule: &NoStringSentinelReturnRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const load = Effect.succeed({ status: "loading" });
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.succeed("loading");
        `, "no-string-sentinel-return"),
			},
		},
		{
			name: "no-string-sentinel-const",
			rule: &NoStringSentinelConstRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const status = { kind: "loading" };
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const status = "loading";
        `, "no-string-sentinel-const"),
			},
		},
		{
			name: "no-manual-effect-channels",
			rule: &NoManualEffectChannelsRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
type Load = string;
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
type Load = Effect.Effect<string, Error, never>;
        `, "no-manual-effect-channels"),
			},
		},
		{
			name: "no-effect-type-alias",
			rule: &NoEffectTypeAliasRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
type Load = { readonly run: number };
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
type Load = Effect.Effect<number, never, never>;
        `, "no-effect-type-alias"),
			},
		},
		{
			name: "no-fromnullable-nullish-coalesce",
			rule: &NoFromnullableNullishCoalesceRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const value: string | null;
const load = Option.fromNullable(value);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const value: string | null;
const load = Option.fromNullable(value ?? null);
        `, "no-fromnullable-nullish-coalesce"),
			},
		},
		{
			name: "no-effect-sync-console",
			rule: &NoEffectSyncConsoleRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare function task(): void;
const load = Effect.sync(() => task());
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.sync(() => console.log("hello"));
        `, "no-effect-sync-console"),
			},
		},
		{
			name: "no-call-tower",
			rule: &NoCallTowerRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
const load = Effect.map(
  Effect.flatMap(task, (value: unknown) => value),
  (value: unknown) => value,
);
        `, "no-call-tower"),
			},
		},
		{
			name: "no-effect-orElse-ladder",
			rule: &NoEffectOrElseLadderRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
declare const fallback: any;
const load = Effect.orElse(task, () => fallback);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
declare const fallback: any;
const load = Effect.orElse(
  Effect.flatMap(task, (value: unknown) => Effect.succeed(value)),
  () => fallback,
);
        `, "no-effect-orElse-ladder"),
			},
		},
		{
			name: "no-flatmap-ladder",
			rule: &NoFlatmapLadderRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.flatMap(task, (value: unknown) => Effect.succeed(value));
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
declare const other: any;
const load = Effect.flatMap(
  task,
  () => Effect.flatMap(other, (value: unknown) => Effect.succeed(value)),
);
        `, "no-flatmap-ladder"),
			},
		},
		{
			name: "no-iife-wrapper",
			rule: &NoIifeWrapperRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
function compute() {
  return 1;
}
const value = compute();
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const value = (() => 1)();
        `, "no-iife-wrapper"),
			},
		},
		{
			name: "no-match-void-branch",
			rule: &NoMatchVoidBranchRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const Match: any;
declare const flag: boolean;
const load = Match.value(flag).pipe(
  Match.when(true, () => Effect.succeed(1)),
  Match.orElse(() => Effect.succeed(0)),
);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const Match: any;
declare const flag: boolean;
const load = Match.value(flag).pipe(
  Match.when(true, () => Effect.void),
  Match.orElse(() => Effect.succeed(0)),
);
        `, "no-match-void-branch"),
			},
		},
	}

	for _, tc := range cases {
		tc := tc
		t.Run(tc.name, func(t *testing.T) {
			runLintEffectRuleTester(t, tc.rule, tc.valid, tc.invalid)
		})
	}
}
