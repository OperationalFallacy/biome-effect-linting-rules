// lintcn:name no-arrow-ladder
// lintcn:description Rule: avoid nested IIFEs. Why: they hide sequencing and push wrapper hacks. Fix: bind a named context with const and keep one flat pipeline with a single Match/Option decision.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-arrow-ladder.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoArrowLadderRule = rule.Rule{
	Name: "no-arrow-ladder",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if nested := nestedArrowIife(node); nested != nil {
					reportRule(ctx, nested, "noArrowLadder", "Rule: avoid nested IIFEs. Why: they hide sequencing and push wrapper hacks. Fix: bind a named context with const and keep one flat pipeline with a single Match/Option decision.")
				}
			},
		}
	},
}
