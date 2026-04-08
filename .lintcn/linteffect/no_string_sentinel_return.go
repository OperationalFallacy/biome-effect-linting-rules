// lintcn:name no-string-sentinel-return
// lintcn:description Rule: avoid returning string tokens. Why: it encodes control flow and forces defensive branching. Fix: return domain values (Option/Either/tagged unions) or real Effect results instead.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-string-sentinel-return.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoStringSentinelReturnRule = rule.Rule{
	Name: "no-string-sentinel-return",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Effect", "succeed") {
					return
				}
				arg := firstCallArgument(node)
				if arg != nil && arg.Kind == ast.KindStringLiteral {
					reportRule(ctx, node, "noStringSentinelReturn", "Rule: avoid returning string tokens. Why: it encodes control flow and forces defensive branching. Fix: return domain values (Option/Either/tagged unions) or real Effect results instead.")
				}
			},
		}
	},
}
