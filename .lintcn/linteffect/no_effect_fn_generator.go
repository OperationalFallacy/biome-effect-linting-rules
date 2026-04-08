// lintcn:name no-effect-fn-generator
// lintcn:description Rule: avoid Effect.fn generator wrappers. Why: they hide sequencing and dodge ladder rules. Fix: keep a single flat pipeline or use one Effect.gen.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-fn-generator.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectFnGeneratorRule = rule.Rule{
	Name: "no-effect-fn-generator",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCall(node, "Effect", "fn") && firstArgumentIsGeneratorFunction(node) {
					reportRule(ctx, node, "noEffectFnGenerator", "Rule: avoid Effect.fn generator wrappers. Why: they hide sequencing and dodge ladder rules. Fix: keep a single flat pipeline or use one Effect.gen.")
				}
			},
		}
	},
}
