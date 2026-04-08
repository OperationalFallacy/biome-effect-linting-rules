// lintcn:name no-model-overlay-cast
// lintcn:description Rule: avoid `as` assertions on decoded model flow. Why: assertions hide schema drift and allow untyped overlays. Fix: decode with the correct schema type and read fields directly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-model-overlay-cast.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoModelOverlayCastRule = rule.Rule{
	Name: "no-model-overlay-cast",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindVariableDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isConstVariableDeclaration(node) {
					return
				}
				init := node.AsVariableDeclaration().Initializer
				if init == nil {
					return
				}
				if init.Kind != ast.KindAsExpression {
					return
				}
				if nodeText(init.AsAsExpression().Type) != "const" {
					reportRule(ctx, node, "noModelOverlayCast", "Rule: avoid `as` assertions on decoded model flow. Why: assertions hide schema drift and allow untyped overlays. Fix: decode with the correct schema type and read fields directly.")
				}
			},
		}
	},
}
