// lintcn:name no-effect-side-effect-wrapper
// lintcn:description Rule: avoid Effect.as/Effect.zipRight for side effects. Why: they hide side effects and discard intent. Fix: use explicit pipeline steps that return real values (Effect.flatMap/andThen/tap).
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-side-effect-wrapper.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectSideEffectWrapperRule = rule.Rule{
	Name: "no-effect-side-effect-wrapper",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isEffectSideEffectWrapper(node) {
					reportRule(ctx, node, "noEffectSideEffectWrapper", "Rule: avoid Effect.as/Effect.zipRight for side effects. Why: they hide side effects and discard intent. Fix: use explicit pipeline steps that return real values (Effect.flatMap/andThen/tap).")
				}
			},
		}
	},
}
