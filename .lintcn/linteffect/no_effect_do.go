// lintcn:name no-effect-do
// lintcn:description Rule: avoid Effect.Do. Why: it pushes Effect code toward imperative builder choreography. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-do.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectDoRule = rule.Rule{
	Name: "no-effect-do",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindPropertyAccessExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isPropertyAccess(node, "Effect", "Do") {
					reportRule(ctx, node, "noEffectDo", "Rule: avoid Effect.Do. Why: it pushes Effect code toward imperative builder choreography. Fix: use one flat pipe-based Effect flow or one direct top-level Effect.gen with direct yields, not nested generators or wrapper helpers.")
				}
			},
		}
	},
}
