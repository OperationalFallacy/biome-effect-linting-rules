import { Effect } from "effect";

declare const invalidate: (key: readonly string[]) => Effect.Effect<void>;
declare const setReady: Effect.Effect<void>;
declare const nextStep: Effect.Effect<string>;

export const invalidAsWrapper = Effect.as(
  Effect.sync(() => {
    console.info("ready");
  }),
  "ready",
);

export const invalidZipRightWrapper = Effect.zipRight(
  invalidate(["quotes"]),
  nextStep,
);

export const invalidNestedSetStateWrapper = Effect.zipRight(
  Effect.sync(() => {
    setState({ ready: true });
  }),
  setReady,
);

declare function setState(value: { readonly ready: boolean }): void;
