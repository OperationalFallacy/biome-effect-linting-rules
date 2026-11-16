import { Match } from "effect";
import { createElement } from "react";

type LabelProps = {
  readonly ready: boolean;
  readonly onReport: (message: string) => void;
};

/**
 * Label displays whether the action is ready and must report "Ready" when
 * the user clicks its enabled button. This Match reports during render, which
 * React may repeat without a click, and the button has no click handler.
 */
export function Label({ ready, onReport }: LabelProps) {
  // It incorrectly reports readiness during render.
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
