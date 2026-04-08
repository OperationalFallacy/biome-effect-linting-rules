// lintcn:name no-branch-in-object
// lintcn:description Rule: avoid Match/Option/Either inside object literals. Why: it hides the decision and invites workaround scaffolding. Fix: compute the value first (context), then build the object from named values with one flat decision.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-branch-in-object.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoBranchInObjectRule = rule.Rule{
	Name: "no-branch-in-object",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindObjectLiteralExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, ":\\s*(?:Match\\.value\\([\\s\\S]*?\\)\\.pipe\\(|Option\\.match\\(|Either\\.match\\()") {
					reportRule(ctx, node, "noBranchInObject", "Rule: avoid Match/Option/Either inside object literals. Why: it hides the decision and invites workaround scaffolding. Fix: compute the value first (context), then build the object from named values with one flat decision.")
				}
			},
		}
	},
}
