// lintcn:name no-string-sentinel-const
// lintcn:description Rule: avoid string status constants. Why: they encode control flow and force defensive branching. Fix: use tagged unions, Option/Either, or meaningful domain values instead of string tokens.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-string-sentinel-const.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoStringSentinelConstRule = rule.Rule{
	Name: "no-string-sentinel-const",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindVariableDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isConstVariableDeclaration(node) {
					return
				}
				init := node.AsVariableDeclaration().Initializer
				if init != nil && init.Kind == ast.KindStringLiteral {
					reportRule(ctx, node, "noStringSentinelConst", "Rule: avoid string status constants. Why: they encode control flow and force defensive branching. Fix: use tagged unions, Option/Either, or meaningful domain values instead of string tokens.")
				}
			},
		}
	},
}
