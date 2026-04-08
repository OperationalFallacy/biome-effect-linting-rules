// lintcn:name no-effect-never
// lintcn:description Rule: avoid Effect.never. Why: it hides lifecycle and leaks resources. Fix: use Stream or explicit acquire/release lifecycles with clear teardown.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-never.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectNeverRule = rule.Rule{
	Name: "no-effect-never",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindPropertyAccessExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isPropertyAccess(node, "Effect", "never") {
					reportRule(ctx, node, "noEffectNever", "Rule: avoid Effect.never. Why: it hides lifecycle and leaks resources. Fix: use Stream or explicit acquire/release lifecycles with clear teardown.")
				}
			},
		}
	},
}
