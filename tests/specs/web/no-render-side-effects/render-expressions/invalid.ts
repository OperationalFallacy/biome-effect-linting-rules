import { Match } from "effect";
import { createElement } from "react";

type LabelProps = {
  readonly ready: boolean;
  readonly onReport: (message: string) => void;
};

/**
 * Incorrectly reports state during rendering. React can render the component
 * repeatedly, so the callback runs without a user action and may run again.
 */
export function Label({ ready, onReport }: LabelProps) {
  Match.value(ready).pipe(
    Match.when(true, () => onReport("Ready")),
    Match.orElse(() => undefined),
  );
  const label = Match.value(ready).pipe(
    Match.when(true, () => "Ready"),
    Match.orElse(() => "Waiting"),
  );
  return createElement("button", { type: "button", disabled: !ready }, label);
}
