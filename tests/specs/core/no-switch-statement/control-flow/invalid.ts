import { Effect, Match } from "effect";

declare const _unused: Effect.Effect<number>;

const switchDescribe = (kind: "a" | "b" | "c"): string => {
  switch (kind) {
    case "a":
      return "Alpha";
    case "b":
      return "Beta";
    default:
      return "Gamma";
  }
};

function valueSwitchChoose(value) {
  switch (value) {
    case 1:
      return 1;
    default:
      return 0;
  }
}

const matchValueDescribe = (kind: "a" | "b" | "c"): string =>
  Match.value(kind).pipe(
    Match.when("a", () => "Alpha"),
    Match.when("b", () => "Beta"),
    Match.orElse(() => "Gamma"),
  );

const operationSwitchChoose = Effect.fn("choose")(function* (value) {
  switch (value) {
    case 1:
      return 1;
    default:
      return 0;
  }
});
