// lintcn:name no-return-in-callback
// lintcn:severity warn
// lintcn:description Rule: avoid returns inside inline callbacks. Why: they hide control flow. Prefer expression-only callbacks, but leaf-level Effect branches with local bindings may use returns when needed.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-return-in-callback.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoReturnInCallbackRule = rule.Rule{
	Name: "no-return-in-callback",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if ret := firstReturnInFunctionCallbackArgs(node); ret != nil {
					reportRule(ctx, ret, "noReturnInCallback", "Rule: avoid returns inside inline callbacks. Why: they hide control flow. Prefer expression-only callbacks, but leaf-level Effect branches with local bindings may use returns when needed.")
				}
			},
		}
	},
}
