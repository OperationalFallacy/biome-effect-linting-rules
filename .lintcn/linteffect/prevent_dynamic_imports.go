// lintcn:name prevent-dynamic-imports
// lintcn:description Rule: avoid dynamic module imports. Why: they hide dependencies and control flow behind deferred module loading, which makes code paths harder to read and verify. Fix: use static module imports so module dependencies stay explicit at the file boundary.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/prevent-dynamic-imports.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var PreventDynamicImportsRule = rule.Rule{
	Name: "prevent-dynamic-imports",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if node.AsCallExpression().Expression.Kind == ast.KindImportKeyword {
					reportRule(ctx, node, "preventDynamicImports", "Rule: avoid dynamic module imports. Why: they hide dependencies and control flow behind deferred module loading, which makes code paths harder to read and verify. Fix: use static module imports so module dependencies stay explicit at the file boundary.")
				}
			},
		}
	},
}
