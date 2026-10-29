import { Match } from "effect";

type LabelProps = {
  readonly ready: boolean;
  readonly onReport: (message: string) => void;
};

/**
 * Correctly keeps rendering pure and performs the action from an event handler.
 * Choosing display text does not change application state.
 */
export function Label({ ready, onReport }: LabelProps) {
  const label = Match.value(ready).pipe(
    Match.when(true, () => "Ready"),
    Match.orElse(() => "Waiting"),
  );
  return (
    <button type="button" disabled={!ready} onClick={() => onReport("Ready")}>
      {label}
    </button>
  );
}
