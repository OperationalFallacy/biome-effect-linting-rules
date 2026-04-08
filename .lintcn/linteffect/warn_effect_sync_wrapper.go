// lintcn:name warn-effect-sync-wrapper
// lintcn:severity warn
// lintcn:description Rule: avoid Effect.sync around side effects. Why: it hides intent. Fix: use Effect.log* or an explicit pipeline step for the side effect.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/warn-effect-sync-wrapper.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var WarnEffectSyncWrapperRule = rule.Rule{
	Name: "warn-effect-sync-wrapper",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isEffectSyncSideEffectWrapper(node) {
					reportRule(ctx, node, "warnEffectSyncWrapper", "Rule: avoid Effect.sync around side effects. Why: it hides intent. Fix: use Effect.log* or an explicit pipeline step for the side effect.")
				}
			},
		}
	},
}
