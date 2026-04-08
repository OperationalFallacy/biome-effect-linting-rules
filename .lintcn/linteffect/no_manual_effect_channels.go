// lintcn:name no-manual-effect-channels
// lintcn:description Rule: avoid manual Effect channel tuples (`Effect.Effect<...>` / `Layer.Layer<...>`). Why: channels compose through the Effect pipeline and services; hand-written tuples desync from the real flow. Fix: drop the generic and let the return type infer from the Effect/Layer you return, or expose a service method that returns the effect directly.
// lintcn:source https://github.com/OperationalFallacy/biome-effect-linting-rules/blob/master/rules/no-manual-effect-channels.grit

package linteffect

import (
	"github.com/microsoft/typescript-go/shim/ast"
	"github.com/typescript-eslint/tsgolint/internal/rule"
)

var NoManualEffectChannelsRule = rule.Rule{
	Name: "no-manual-effect-channels",
	Run: func(ctx rule.RuleContext, options any) rule.RuleListeners {
		return rule.RuleListeners{
			ast.KindTypeReference: func(node *ast.Node) {
				if !isEffectFile(ctx) {
					return
				}
				if textMatches(node, "^(Effect\\.Effect|Layer\\.Layer)\\s*<") {
					reportRule(ctx, node, "noManualEffectChannels", "Rule: avoid manual Effect channel tuples (`Effect.Effect<...>` / `Layer.Layer<...>`). Why: channels compose through the Effect pipeline and services; hand-written tuples desync from the real flow. Fix: drop the generic and let the return type infer from the Effect/Layer you return, or expose a service method that returns the effect directly.")
				}
			},
		}
	},
}
