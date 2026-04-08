// lintcn:name no-react-state
// lintcn:description Rule: avoid React state hooks. Why: they bypass the atom runtime and break reactive flow. Fix: use @effect-atom/atom-react instead of useState/useReducer/useContext/useEffect/useCallback/useSyncExternalStore.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-react-state.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoReactStateRule = rule.Rule{
	Name: "no-react-state",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindCallExpression: func(node *ast.Node) {
				if isReactHookCall(node) {
					reportRule(ctx, node.Expression(), "noReactState", "Rule: avoid React state hooks. Why: they bypass the atom runtime and break reactive flow. Fix: use @effect-atom/atom-react instead of useState/useReducer/useContext/useEffect/useCallback/useSyncExternalStore.")
				}
			},
		}
	},
}
