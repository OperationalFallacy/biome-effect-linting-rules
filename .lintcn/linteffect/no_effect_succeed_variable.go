// lintcn:name no-effect-succeed-variable
// lintcn:severity warn
// lintcn:description Rule: avoid Effect.succeed(variable) as a branch placeholder. Why: it hides a decision and turns data into pseudo-control flow. Fix: select a plain value (Option/Match) and then run one Effect pipeline after the decision; if you already read the state, return it as a value. Avoid Option.toArray/forEach hacks that just re-encode the branch.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-succeed-variable.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectSucceedVariableRule = rule.Rule{
	Name: "no-effect-succeed-variable",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Effect", "succeed") {
					return
				}
				arg := firstCallArgument(node)
				if arg == nil || isDisallowedEffectSucceedArgument(arg) {
					return
				}
				reportRule(ctx, node, "noEffectSucceedVariable", "Rule: avoid Effect.succeed(variable) as a branch placeholder. Why: it hides a decision and turns data into pseudo-control flow. Fix: select a plain value (Option/Match) and then run one Effect pipeline after the decision; if you already read the state, return it as a value. Avoid Option.toArray/forEach hacks that just re-encode the branch.")
			},
		}
	},
}
