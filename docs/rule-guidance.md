# Biome Grit rule guidance

Scope: Each rule must target one concrete anti-pattern in Effect usage and emit one diagnostic with a single actionable message.

Grammar references:

`rules/js.ungram` and `rules/gritql.ungram` are contributor-only reference files copied from the Biome source repository. They help when you need the current node names and grammar shapes while authoring or updating rules. They are not required by Biome to execute the published rules, and they are not part of the npm runtime contract.

Refresh those files with:

`yarn refresh:biome-grammars --ref <biome-git-ref>`

Use an explicit Biome tag or commit when aligning a contribution to a specific upstream version.

Match strategy: 

Anchor the diagnostic span on the prohibited operator. 

Constrain by context using `contains` on the same pipe chain or explicit call site, not broad file-wide matches.
Diagnostic message: Include context that tells the agent what not to do and the idiomatic Effect approach to use instead, phrased to steer toward terse declarative flows rather than imperative wrappers or re-wrapping.

Grit limitations: 

Avoid unsupported features such as rewrites, suppressions, and multi-file matches. Prefer simple captures plus `contains` checks when variadic or nested bindings fail.

Validation: test new rules directly with the Biome CLI using a minimal config that loads only the new rule and lint the single file named by the user.

Activation: add the rule to main config, `biome.jsonc`.
