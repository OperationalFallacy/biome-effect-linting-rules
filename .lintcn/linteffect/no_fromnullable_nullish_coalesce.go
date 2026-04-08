// lintcn:name no-fromnullable-nullish-coalesce
// lintcn:description Rule: avoid nullish re-wrap inside Option.fromNullable. Why: `x ?? null` and `x ?? undefined` add noise and hide source shape. Fix: pass the source directly to Option.fromNullable.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-fromnullable-nullish-coalesce.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoFromnullableNullishCoalesceRule = rule.Rule{
	Name: "no-fromnullable-nullish-coalesce",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Option", "fromNullable") {
					return
				}
				if textMatches(firstCallArgument(node), "\\?\\?\\s*(null|undefined)\\s*$") {
					reportRule(ctx, node, "noFromnullableNullishCoalesce", "Rule: avoid nullish re-wrap inside Option.fromNullable. Why: `x ?? null` and `x ?? undefined` add noise and hide source shape. Fix: pass the source directly to Option.fromNullable.")
				}
			},
		}
	},
}
