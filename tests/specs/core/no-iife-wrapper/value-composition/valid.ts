import { Match } from "effect";

type State = { readonly _tag: "Ready"; readonly value: string } | {
  readonly _tag: "Pending";
};

/**
 * Correctly expresses value selection directly with Match. The selected value
 * needs no wrapper function or additional invocation.
 */
export const selectLabel = (state: State) =>
  Match.value(state).pipe(
    Match.when({ _tag: "Ready" }, (ready) => ready.value),
    Match.orElse(() => "Pending"),
  );
