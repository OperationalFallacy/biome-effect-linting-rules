// lintcn:name no-effect-wrapper-alias
// lintcn:description Rule: avoid Effect wrapper aliases. Why: they create wrapper choreography and bloat local helpers. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-effect-wrapper-alias.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoEffectWrapperAliasRule = rule.Rule{
	Name: "no-effect-wrapper-alias",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindVariableDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isEffectWrapperAliasVariable(node) {
					reportRule(ctx, node, "noEffectWrapperAlias", "Rule: avoid Effect wrapper aliases. Why: they create wrapper choreography and bloat local helpers. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.")
				}
			},
			ast.KindFunctionDeclaration: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isEffectWrapperAliasFunction(node) {
					reportRule(ctx, node, "noEffectWrapperAlias", "Rule: avoid Effect wrapper aliases. Why: they create wrapper choreography and bloat local helpers. Fix: inline the pipeline at the call site or define a real domain function that returns data, not an Effect wrapper.")
				}
			},
		}
	},
}
