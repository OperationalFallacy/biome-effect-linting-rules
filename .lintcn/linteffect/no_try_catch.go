// lintcn:name no-try-catch
// lintcn:description Rule: avoid try/catch in Effect files. Why: it bypasses Effect error channels and reintroduces imperative control flow. Fix: model failures in Effect and handle them with typed errors and Effect combinators.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-try-catch.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoTryCatchRule = rule.Rule{
	Name: "no-try-catch",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindTryStatement: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				reportRule(ctx, node, "noTryCatch", "Rule: avoid try/catch in Effect files. Why: it bypasses Effect error channels and reintroduces imperative control flow. Fix: model failures in Effect and handle them with typed errors and Effect combinators.")
			},
		}
	},
}
