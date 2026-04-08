// lintcn:name no-nested-effect-call
// lintcn:description Rule: avoid deeply nested Effect calls (Effect.xx(Effect.yy(Effect.zz(...)))). Why: they hide sequencing and spread flow. Fix: build values first, then run one flat Effect pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-nested-effect-call.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoNestedEffectCallRule = rule.Rule{
	Name: "no-nested-effect-call",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if hasDeepEffectCall(node) {
					reportRule(ctx, node, "noNestedEffectCall", "Rule: avoid deeply nested Effect calls (Effect.xx(Effect.yy(Effect.zz(...)))). Why: they hide sequencing and spread flow. Fix: build values first, then run one flat Effect pipeline.")
				}
			},
		}
	},
}
