// lintcn:name no-effect-type-alias
// lintcn:description Rule: avoid Effect.Effect type aliases. Why: they hide the service surface and make types opaque. Fix: keep Effect types on service methods or inline at the call site.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-type-alias.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectTypeAliasRule = rule.Rule{
	Name: "no-effect-type-alias",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindTypeAliasDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if stringsContainsNodeText(node.AsTypeAliasDeclaration().Type, "Effect.Effect") {
					reportRule(ctx, node.AsTypeAliasDeclaration().Type, "noEffectTypeAlias", "Rule: avoid Effect.Effect type aliases. Why: they hide the service surface and make types opaque. Fix: keep Effect types on service methods or inline at the call site.")
				}
			},
		}
	},
}
