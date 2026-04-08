// lintcn:name no-match-effect-branch
// lintcn:severity warn
// lintcn:description Rule: avoid multi-step sequencing inside Match or Option branches. Why: it hides control flow. Fix: select a value in Match/Option first, then run one Effect pipeline outside the branch.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-match-effect-branch.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoMatchEffectBranchRule = rule.Rule{
	Name: "no-match-effect-branch",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMatchEffectBranchCall(node) {
					reportRule(ctx, node, "noMatchEffectBranch", "Rule: avoid multi-step sequencing inside Match or Option branches. Why: it hides control flow. Fix: select a value in Match/Option first, then run one Effect pipeline outside the branch.")
				}
			},
		}
	},
}
