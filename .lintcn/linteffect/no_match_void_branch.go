// lintcn:name no-match-void-branch
// lintcn:description Rule: avoid void Match branches. Why: they hide guard-style control flow. Fix: remove the no-op branch or select a value and run one Effect pipeline outside the Match.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-match-void-branch.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoMatchVoidBranchRule = rule.Rule{
	Name: "no-match-void-branch",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^\\s*Match\\.(?:when\\s*\\(\\s*(?:true|false)\\s*,\\s*\\(\\)\\s*=>\\s*Effect\\.void|orElse\\s*\\(\\s*\\(\\)\\s*=>\\s*Effect\\.void)") {
					reportRule(ctx, node, "noMatchVoidBranch", "Rule: avoid void Match branches. Why: they hide guard-style control flow. Fix: remove the no-op branch or select a value and run one Effect pipeline outside the Match.")
				}
			},
		}
	},
}
