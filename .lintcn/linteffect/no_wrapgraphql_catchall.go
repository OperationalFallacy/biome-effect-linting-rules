// lintcn:name no-wrapgraphql-catchall
// lintcn:description Rule: avoid catchAll after wrapGraphqlCall/applyResponse. Why: the envelope already surfaces structured errors. Fix: handle errors in the response mapping instead of catchAll.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-wrapgraphql-catchall.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoWrapgraphqlCatchallRule = rule.Rule{
	Name: "no-wrapgraphql-catchall",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "(?:wrapGraphqlCall\\(|Effect\\.flatMap\\(applyResponse\\))[\\s\\S]*Effect\\.catchAll\\(") {
					reportRule(ctx, node, "noWrapgraphqlCatchall", "Rule: avoid catchAll after wrapGraphqlCall/applyResponse. Why: the envelope already surfaces structured errors. Fix: handle errors in the response mapping instead of catchAll.")
				}
			},
		}
	},
}
