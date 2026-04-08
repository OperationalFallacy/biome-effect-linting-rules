package linteffect

import (
	"testing"

	"github.com/typescript-eslint/tsgolint/internal/rule"
	"github.com/typescript-eslint/tsgolint/internal/rule_tester"
)

func TestParityRuleCoverage(t *testing.T) {
	t.Parallel()

	cases := []struct {
		name    string
		rule    *rule.Rule
		valid   []rule_tester.ValidTestCase
		invalid []rule_tester.InvalidTestCase
	}{
		{
			name: "no-arrow-ladder",
			rule: &NoArrowLadderRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const value = ((left: number) => left + 1)(1);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const value = ((left: number) => ((right: number) => left + right)(2))(1);
        `, "no-arrow-ladder"),
			},
		},
		{
			name: "no-effect-ladder",
			rule: &NoEffectLadderRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.map(task, (value: unknown) => value);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.map(
  Effect.flatMap(Effect.succeed(1), (value: number) => Effect.succeed(value)),
  (value: number) => value,
);
        `, "no-effect-ladder"),
			},
		},
		{
			name: "no-effect-side-effect-wrapper",
			rule: &NoEffectSideEffectWrapperRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
declare const next: any;
const load = Effect.zipRight(task, next);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const task: any;
const load = Effect.zipRight(Effect.logInfo("start"), task);
        `, "no-effect-side-effect-wrapper"),
			},
		},
		{
			name: "no-effect-wrapper-alias",
			rule: &NoEffectWrapperAliasRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
const formatValue = (value: number) => value + 1;
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const loadUser = () => Effect.succeed(1);
        `, "no-effect-wrapper-alias"),
			},
		},
		{
			name: "no-inline-runtime-provide",
			rule: &NoInlineRuntimeProvideRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const UserRuntime: any;
const program = Effect.gen(function* () {
  return yield* UserRuntime;
});
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const UserRuntime: any;
declare const UserLive: any;
const program = Effect.gen(function* () {
  return yield* UserRuntime.pipe(Effect.provide(UserLive));
});
        `, "no-inline-runtime-provide"),
			},
		},
		{
			name: "no-match-effect-branch",
			rule: &NoMatchEffectBranchRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const Match: any;
declare const flag: boolean;
const load = Match.value(flag).pipe(
  Match.when(true, () => 1),
  Match.orElse(() => 0),
);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const Match: any;
declare const flag: boolean;
const load = Match.value(flag).pipe(
  Match.when(true, () => Effect.succeed(1).pipe(Effect.tap(() => Effect.logInfo("x")))),
  Match.orElse(() => Effect.succeed(0)),
);
        `, "no-match-effect-branch"),
			},
		},
		{
			name: "no-nested-effect-call",
			rule: &NoNestedEffectCallRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const task: any;
const load = Effect.map(task, (value: unknown) => value);
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
const load = Effect.map(
  Effect.flatMap(Effect.succeed(1), (value: number) => Effect.succeed(value)),
  (value: number) => value,
);
        `, "no-nested-effect-call"),
			},
		},
		{
			name: "no-return-in-arrow",
			rule: &NoReturnInArrowRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const value: any;
const load = Option.map(value, (current: string) => current.trim());
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const value: any;
const load = Option.map(value, (current: string) => {
  return current.trim();
});
        `, "no-return-in-arrow"),
			},
		},
		{
			name: "no-return-in-callback",
			rule: &NoReturnInCallbackRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const items: string[];
const load = Array.from(items, (value: string) => value.trim());
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const items: string[];
const load = Array.from(items, function mapper(value: string) {
  return value.trim();
});
        `, "no-return-in-callback"),
			},
		},
		{
			name: "no-unknown-boolean-coercion-helper",
			rule: &NoUnknownBooleanCoercionHelperRule,
			valid: []rule_tester.ValidTestCase{
				validCase(`
"effect";
declare const value: unknown;
const isBoolean = typeof value === "boolean";
        `),
			},
			invalid: []rule_tester.InvalidTestCase{
				invalidRuleCase(`
"effect";
declare const Match: any;
declare const value: unknown;
const isBoolean = typeof value === "boolean";
const normalized = Match.value(value).pipe(Match.orElse(() => null));
        `, "no-unknown-boolean-coercion-helper"),
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
