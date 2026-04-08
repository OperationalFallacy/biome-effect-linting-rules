// lintcn:name no-ternary
// lintcn:description Rule: avoid ternary expressions. Why: they hide control flow inside expressions. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-ternary.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoTernaryRule = rule.Rule{
	Name: "no-ternary",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindConditionalExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				reportRule(ctx, node.AsConditionalExpression().Condition, "noTernary", "Rule: avoid ternary expressions. Why: they hide control flow inside expressions. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.")
			},
		}
	},
}
