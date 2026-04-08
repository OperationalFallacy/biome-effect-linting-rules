// lintcn:name no-atom-registry-effect-sync
// lintcn:description Rule: do not wrap Atom/atomRegistry ops in Effect.sync. Why: it hides side effects and breaks atom flow. Fix: call Atom.get/Atom.set/Atom.update/Atom.modify/Atom.refresh directly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-atom-registry-effect-sync.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoAtomRegistryEffectSyncRule = rule.Rule{
	Name: "no-atom-registry-effect-sync",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if !isMemberCall(node, "Effect", "sync") {
					return
				}
				if textMatches(node, "\\b(?:atomRegistry|Atom)\\.(?:get|set|update|modify|refresh)\\b") {
					reportRule(ctx, node, "noAtomRegistryEffectSync", "Rule: do not wrap Atom/atomRegistry ops in Effect.sync. Why: it hides side effects and breaks atom flow. Fix: call Atom.get/Atom.set/Atom.update/Atom.modify/Atom.refresh directly.")
				}
			},
		}
	},
}
