import { Ref } from "effect";

declare const stateRef: Ref.Ref<{
  readonly subscriptions: Readonly<Record<string, unknown>>;
}>;
declare const id: string;
declare const startFrame: number;
declare const stopFrame: number;

export const invalidAssignPatch = Ref.update(stateRef, (state) =>
  Object.assign({}, state, {
    subscriptions: Object.assign({}, state.subscriptions, {
      [id]: {
        state: "subscribed",
        startFrame,
        stopFrame,
      },
    }),
  }),
);
