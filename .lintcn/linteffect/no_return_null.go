// lintcn:name no-return-null
// lintcn:description Rule: avoid returning null. Why: null is a sentinel that forces defensive guards. Fix: use Option.none for absence or Effect.fail for errors.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-return-null.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoReturnNullRule = rule.Rule{
	Name: "no-return-null",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindReturnStatement: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if expr := node.AsReturnStatement().Expression; expr != nil && expr.Kind == ast.KindNullKeyword {
					reportRule(ctx, node, "noReturnNull", "Rule: avoid returning null. Why: null is a sentinel that forces defensive guards. Fix: use Option.none for absence or Effect.fail for errors.")
				}
			},
		}
	},
}
