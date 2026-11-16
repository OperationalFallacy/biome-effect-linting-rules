import { Match } from "effect";

type LabelProps = {
  readonly ready: boolean;
  readonly onReport: (message: string) => void;
};

/**
 * Label displays whether the action is ready and reports "Ready" when the
 * user clicks its enabled button. The render only selects the display label.
 * A nested event handler uses Match for the command; it runs after the click,
 * so its statement is not a render side effect.
 */
export function Label({ ready, onReport }: LabelProps) {
  function reportReady() {
    // It correctly reports readiness from the event handler.
    Match.value(ready).pipe(
      Match.when(true, () => onReport("Ready")),
      Match.orElse(() => undefined),
    );
  }

  const label = Match.value(ready).pipe(
    Match.when(true, () => "Ready"),
    Match.orElse(() => "Waiting"),
  );
  return (
    <button type="button" disabled={!ready} onClick={reportReady}>
      {label}
    </button>
  );
}
