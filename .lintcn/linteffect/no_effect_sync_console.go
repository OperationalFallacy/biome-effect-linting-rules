// lintcn:name no-effect-sync-console
// lintcn:description Rule: avoid console.* inside Effect.sync. Why: it hides side effects. Fix: replace with Effect.log* or remove the console call.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-sync-console.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectSyncConsoleRule = rule.Rule{
	Name: "no-effect-sync-console",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Effect", "sync") {
					return
				}
				if textMatches(node, "\\bconsole\\.") {
					reportRule(ctx, node, "noEffectSyncConsole", "Rule: avoid console.* inside Effect.sync. Why: it hides side effects. Fix: replace with Effect.log* or remove the console call.")
				}
			},
		}
	},
}
