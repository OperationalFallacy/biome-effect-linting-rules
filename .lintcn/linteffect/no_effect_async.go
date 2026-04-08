// lintcn:name no-effect-async
// lintcn:description Rule: avoid Effect.async. Why: callback-style wiring hides lifecycle and escapes declarative flow. Fix: use Stream or structured Effect lifecycles (acquire/use/release).
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-async.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectAsyncRule = rule.Rule{
	Name: "no-effect-async",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCall(node, "Effect", "async") {
					reportRule(ctx, node, "noEffectAsync", "Rule: avoid Effect.async. Why: callback-style wiring hides lifecycle and escapes declarative flow. Fix: use Stream or structured Effect lifecycles (acquire/use/release).")
				}
			},
		}
	},
}
