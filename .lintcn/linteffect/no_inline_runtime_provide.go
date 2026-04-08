// lintcn:name no-inline-runtime-provide
// lintcn:description Rule: do not inline runtime provisioning inside local helper Effect code. Why: inline provide chains hide dependency assembly instead of owning it at a service or exported boundary. Fix: provide the dependency once at the owning boundary, then yield the runtime or service directly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-inline-runtime-provide.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoInlineRuntimeProvideRule = rule.Rule{
	Name: "no-inline-runtime-provide",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isInlineRuntimeProvideCall(node) {
					reportRule(ctx, node, "noInlineRuntimeProvide", "Rule: do not inline runtime provisioning inside local helper Effect code. Why: inline provide chains hide dependency assembly instead of owning it at a service or exported boundary. Fix: provide the dependency once at the owning boundary, then yield the runtime or service directly.")
				}
			},
		}
	},
}
