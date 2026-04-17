import { Ref } from "effect";

declare const stateRef: Ref.Ref<{
  readonly subscriptions: Readonly<Record<string, unknown>>;
}>;
declare const id: string;
declare const startFrame: number;
declare const stopFrame: number;

export const invalidSpreadPatch = Ref.update(stateRef, (state) => ({
  ...state,
  subscriptions: {
    ...state.subscriptions,
    [id]: {
      state: "subscribed",
      startFrame,
      stopFrame,
    },
  },
}));
