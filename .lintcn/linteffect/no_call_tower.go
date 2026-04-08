// lintcn:name no-call-tower
// lintcn:description Rule: avoid nested Effect call towers (Effect.fn(Effect.fn(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen for a single flat pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-call-tower.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoCallTowerRule = rule.Rule{
	Name: "no-call-tower",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCallOnObject(node, "Effect") && hasMemberCallArgumentOnObject(node, "Effect") {
					reportRule(ctx, node, "noCallTower", "Rule: avoid nested Effect call towers (Effect.fn(Effect.fn(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen for a single flat pipeline.")
				}
			},
		}
	},
}
