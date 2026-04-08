// lintcn:name no-nested-effect-gen
// lintcn:description Rule: avoid nested Effect.gen. Why: nested generators hide sequencing. Fix: flatten to a single Effect.gen per method or a single flat pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-nested-effect-gen.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoNestedEffectGenRule = rule.Rule{
	Name: "no-nested-effect-gen",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^\\s*Effect\\.gen\\([\\s\\S]*\\bEffect\\.gen\\(") {
					reportRule(ctx, node, "noNestedEffectGen", "Rule: avoid nested Effect.gen. Why: nested generators hide sequencing. Fix: flatten to a single Effect.gen per method or a single flat pipeline.")
				}
			},
		}
	},
}
