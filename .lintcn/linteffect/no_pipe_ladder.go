// lintcn:name no-pipe-ladder
// lintcn:description Rule: avoid nested pipe() chains. Why: they hide sequencing. Fix: refactor into one flat pipeline with a single decision point.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-pipe-ladder.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoPipeLadderRule = rule.Rule{
	Name: "no-pipe-ladder",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isPipeCall(node) && hasNestedPipeArgument(node) {
					reportRule(ctx, node, "noPipeLadder", "Rule: avoid nested pipe() chains. Why: they hide sequencing. Fix: refactor into one flat pipeline with a single decision point.")
				}
			},
		}
	},
}
