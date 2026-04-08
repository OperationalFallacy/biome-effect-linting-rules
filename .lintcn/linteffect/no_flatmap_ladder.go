// lintcn:name no-flatmap-ladder
// lintcn:severity warn
// lintcn:description Rule: avoid nested Effect.flatMap or map+flatten ladders. Why: they hide sequencing and push laddered control flow. Fix: build context once (Effect.all/Effect.map) and run a single flatMap.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-flatmap-ladder.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoFlatmapLadderRule = rule.Rule{
	Name: "no-flatmap-ladder",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^\\s*Effect\\.(?:flatMap\\([\\s\\S]*Effect\\.flatMap\\(|flatten\\([\\s\\S]*Effect\\.map\\()") {
					reportRule(ctx, node, "noFlatmapLadder", "Rule: avoid nested Effect.flatMap or map+flatten ladders. Why: they hide sequencing and push laddered control flow. Fix: build context once (Effect.all/Effect.map) and run a single flatMap.")
				}
			},
		}
	},
}
