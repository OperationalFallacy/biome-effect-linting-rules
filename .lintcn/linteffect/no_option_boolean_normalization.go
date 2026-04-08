// lintcn:name no-option-boolean-normalization
// lintcn:description Rule: avoid repeated Option boolean normalization (`onSome: value === true, onNone: false`). Why: it scatters coercion rules across services. Fix: normalize once at schema boundary and read booleans directly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-option-boolean-normalization.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoOptionBooleanNormalizationRule = rule.Rule{
	Name: "no-option-boolean-normalization",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^\\s*Option\\.match\\([\\s\\S]*onSome\\s*:\\s*\\([^)]*\\)\\s*=>\\s*[A-Za-z_$][\\w$]*\\s*===\\s*true[\\s\\S]*onNone\\s*:\\s*\\(\\)\\s*=>\\s*false") {
					reportRule(ctx, node, "noOptionBooleanNormalization", "Rule: avoid repeated Option boolean normalization (`onSome: value === true, onNone: false`). Why: it scatters coercion rules across services. Fix: normalize once at schema boundary and read booleans directly.")
				}
			},
		}
	},
}
