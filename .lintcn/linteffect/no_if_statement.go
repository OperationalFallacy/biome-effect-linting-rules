// lintcn:name no-if-statement
// lintcn:description Rule: avoid imperative if branching. Why: it hides control flow in Effect code. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-if-statement.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoIfStatementRule = rule.Rule{
	Name: "no-if-statement",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindIfStatement: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				reportRule(ctx, node.AsIfStatement().Expression, "noIfStatement", "Rule: avoid imperative if branching. Why: it hides control flow in Effect code. Fix: use Option.match/Either.match/Match.value or data combinators, then run one Effect pipeline.")
			},
		}
	},
}
