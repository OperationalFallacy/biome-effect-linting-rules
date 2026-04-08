// lintcn:name no-effect-ladder
// lintcn:description Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-ladder.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectLadderRule = rule.Rule{
	Name: "no-effect-ladder",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindVariableDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if init := node.AsVariableDeclaration().Initializer; hasDeepEffectCall(init) {
					reportRule(ctx, init, "noEffectLadder", "Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.")
				}
			},
			ast.KindReturnStatement: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if expr := node.AsReturnStatement().Expression; hasDeepEffectCall(expr) {
					reportRule(ctx, expr, "noEffectLadder", "Rule: avoid nested Effect combinators. Why: they hide sequencing and create laddered control flow. Fix: build context once (Effect.all/Effect.map) and then run a single flat pipeline.")
				}
			},
		}
	},
}
