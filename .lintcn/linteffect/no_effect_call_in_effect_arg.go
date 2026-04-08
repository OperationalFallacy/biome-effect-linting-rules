// lintcn:name no-effect-call-in-effect-arg
// lintcn:description Rule: avoid Effect calls nested as arguments (Effect.xx(Effect.yy(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen to keep a single flat pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-call-in-effect-arg.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectCallInEffectArgRule = rule.Rule{
	Name: "no-effect-call-in-effect-arg",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCallOnObject(node, "Effect") && hasMemberCallArgumentOnObject(node, "Effect") {
					reportRule(ctx, node, "noEffectCallInEffectArg", "Rule: avoid Effect calls nested as arguments (Effect.xx(Effect.yy(...))). Why: it hides sequencing. Fix: build the inner Effect first, then use pipe/Effect.flatMap/Effect.andThen to keep a single flat pipeline.")
				}
			},
		}
	},
}
