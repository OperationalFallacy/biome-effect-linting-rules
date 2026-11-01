import { Match } from "effect";

type State = { readonly _tag: "Ready"; readonly value: string } | {
  readonly _tag: "Pending";
};

/**
 * Unnecessarily wraps value selection in an immediately invoked function.
 * The extra function call makes a local expression look like another operation.
 */
export const selectLabel = (state: State) =>
  (() =>
    Match.value(state).pipe(
      Match.when({ _tag: "Ready" }, (ready) => ready.value),
      Match.orElse(() => "Pending"),
    ))();
