// lintcn:name no-unknown-boolean-coercion-helper
// lintcn:description Rule: avoid local unknown-to-boolean coercion helpers in services. Why: runtime coercion belongs at schema boundary, not in service flow. Fix: decode boolean optionality in schema and read typed booleans in the Effect pipeline.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-unknown-boolean-coercion-helper.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoUnknownBooleanCoercionHelperRule = rule.Rule{
	Name: "no-unknown-boolean-coercion-helper",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindBinaryExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isTypeofBooleanCheck(node) && sourceTextMatches(ctx, "Match\\.orElse\\(\\s*\\(\\)\\s*=>\\s*null\\s*\\)") {
					reportRule(ctx, node, "noUnknownBooleanCoercionHelper", "Rule: avoid local unknown-to-boolean coercion helpers in services. Why: runtime coercion belongs at schema boundary, not in service flow. Fix: decode boolean optionality in schema and read typed booleans in the Effect pipeline.")
				}
			},
		}
	},
}
