// lintcn:name no-effect-all-step-sequencing
// lintcn:description Rule: avoid Effect.all for sequential side-effect steps. Why: it hides imperative sequencing in an array. Fix: use one explicit linear pipeline with Effect.andThen/flatMap and reserve Effect.all for real value aggregation.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-all-step-sequencing.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectAllStepSequencingRule = rule.Rule{
	Name: "no-effect-all-step-sequencing",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if textMatches(node, "^\\s*Effect\\.all\\([\\s\\S]*(?:Ref\\.set|Atom\\.set|SubscriptionRef\\.set|Reactivity\\.invalidate|Fiber\\.interrupt|Effect\\.log[A-Za-z]*)[\\s\\S]*(?:concurrency\\s*:\\s*1|\\.pipe\\(\\s*Effect\\.asVoid\\s*\\))") {
					reportRule(ctx, node, "noEffectAllStepSequencing", "Rule: avoid Effect.all for sequential side-effect steps. Why: it hides imperative sequencing in an array. Fix: use one explicit linear pipeline with Effect.andThen/flatMap and reserve Effect.all for real value aggregation.")
				}
			},
		}
	},
}
