// lintcn:name no-effect-orElse-ladder
// lintcn:description Rule: avoid Effect.orElse around sequencing chains. Why: it hides error handling and splits the flow. Fix: move error handling to a single terminal decision after the pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-orElse-ladder.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectOrElseLadderRule = rule.Rule{
	Name: "no-effect-orElse-ladder",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Effect", "orElse") {
					return
				}
				if textMatches(node, "Effect\\.(?:flatMap|zipRight|as|tap)\\(") {
					reportRule(ctx, node, "noEffectOrElseLadder", "Rule: avoid Effect.orElse around sequencing chains. Why: it hides error handling and splits the flow. Fix: move error handling to a single terminal decision after the pipeline.")
				}
			},
		}
	},
}
