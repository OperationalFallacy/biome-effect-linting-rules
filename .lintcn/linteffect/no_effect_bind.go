// lintcn:name no-effect-bind
// lintcn:description Rule: avoid Effect.bind. Why: it hides sequencing inside builder-style accumulation. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-bind.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectBindRule = rule.Rule{
	Name: "no-effect-bind",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCall(node, "Effect", "bind") {
					reportRule(ctx, node, "noEffectBind", "Rule: avoid Effect.bind. Why: it hides sequencing inside builder-style accumulation. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.")
				}
			},
		}
	},
}
