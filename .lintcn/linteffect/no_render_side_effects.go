// lintcn:name no-render-side-effects
// lintcn:description Rule: avoid Match.value(...).pipe(...) as a statement. Why: it runs side effects during render. Fix: move the side effect into an Effect runtime action or event handler, and keep Match as a pure expression.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-render-side-effects.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoRenderSideEffectsRule = rule.Rule{
	Name: "no-render-side-effects",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^\\s*Match\\.value\\([\\s\\S]*\\.pipe\\([\\s\\S]*Match\\.(?:when|orElse)\\([\\s\\S]*=>\\s*(?:void\\s+)?Effect\\.") {
					reportRule(ctx, node, "noRenderSideEffects", "Rule: avoid Match.value(...).pipe(...) as a statement. Why: it runs side effects during render. Fix: move the side effect into an Effect runtime action or event handler, and keep Match as a pure expression.")
				}
			},
		}
	},
}
