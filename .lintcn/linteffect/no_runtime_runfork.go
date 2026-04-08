// lintcn:name no-runtime-runfork
// lintcn:description Rule: avoid Runtime.runFork. Why: it escapes structured concurrency. Fix: use forkScoped, Stream, or runtime-provided layers instead.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-runtime-runfork.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoRuntimeRunforkRule = rule.Rule{
	Name: "no-runtime-runfork",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if isMemberCall(node, "Runtime", "runFork") {
					reportRule(ctx, node, "noRuntimeRunfork", "Rule: avoid Runtime.runFork. Why: it escapes structured concurrency. Fix: use forkScoped, Stream, or runtime-provided layers instead.")
				}
			},
		}
	},
}
