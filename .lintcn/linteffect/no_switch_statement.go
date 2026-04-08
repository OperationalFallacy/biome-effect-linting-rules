// lintcn:name no-switch-statement
// lintcn:description Rule: avoid imperative switch branching. Why: it hides control flow in Effect code and encourages case-by-case sequencing. Fix: use Match.value, Option.match, Either.match, or Effect.if, then run one explicit pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-switch-statement.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoSwitchStatementRule = rule.Rule{
	Name: "no-switch-statement",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindSwitchStatement: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				reportRule(ctx, node.AsSwitchStatement().Expression, "noSwitchStatement", "Rule: avoid imperative switch branching. Why: it hides control flow in Effect code and encourages case-by-case sequencing. Fix: use Match.value, Option.match, Either.match, or Effect.if, then run one explicit pipeline.")
			},
		}
	},
}
