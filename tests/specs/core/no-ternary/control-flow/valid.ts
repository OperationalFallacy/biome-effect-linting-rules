import { Match } from "effect";

const total = Match.value(enabled).pipe(
  Match.when(true, () => calculateTotal(rows)),
  Match.orElse(() => 0),
);
