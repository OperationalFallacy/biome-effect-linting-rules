import { Match } from "effect";

export const describe = (kind: "a" | "b" | "c"): string =>
  Match.value(kind).pipe(
    Match.when("a", () => "Alpha"),
    Match.when("b", () => "Beta"),
    Match.orElse(() => "Gamma"),
  );
