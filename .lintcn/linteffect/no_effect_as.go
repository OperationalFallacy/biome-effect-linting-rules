// lintcn:name no-effect-as
// lintcn:description Rule: avoid Effect.as. Why: it hides sequencing and turns effects into placeholders. Fix: use Effect.map for value mapping or Effect.asVoid after explicit pipeline steps.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-as.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectAsRule = rule.Rule{
	Name: "no-effect-as",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if isMemberCall(node, "Effect", "as") {
					reportRule(ctx, node, "noEffectAs", "Rule: avoid Effect.as. Why: it hides sequencing and turns effects into placeholders. Fix: use Effect.map for value mapping or Effect.asVoid after explicit pipeline steps.")
				}
			},
		}
	},
}
