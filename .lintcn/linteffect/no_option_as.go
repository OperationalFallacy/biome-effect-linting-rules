// lintcn:name no-option-as
// lintcn:description Rule: avoid Option.as. Why: it hides selection and encourages placeholder flows. Fix: use Option.map or Option.match and return the value explicitly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-option-as.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoOptionAsRule = rule.Rule{
	Name: "no-option-as",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCall(node, "Option", "as") {
					reportRule(ctx, node, "noOptionAs", "Rule: avoid Option.as. Why: it hides selection and encourages placeholder flows. Fix: use Option.map or Option.match and return the value explicitly.")
				}
			},
		}
	},
}
