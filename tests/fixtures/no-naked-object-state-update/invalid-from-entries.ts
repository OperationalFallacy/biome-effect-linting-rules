import { Ref, Struct } from "effect";

declare const stateRef: Ref.Ref<{
  readonly subscriptions: Readonly<Record<string, unknown>>;
}>;
declare const id: string;
declare const startFrame: number;
declare const stopFrame: number;
declare const SocketStateSchema: {
  readonly fields: {
    readonly subscriptions: {
      readonly make: (value: unknown) => unknown;
    };
  };
};

export const invalidEntryRebuild = Ref.update(
  stateRef,
  Struct.evolve({
    subscriptions: (subscriptions: Record<string, unknown>) =>
      SocketStateSchema.fields.subscriptions.make(
        Object.fromEntries(
          Array.from(Object.entries(subscriptions)).concat([
            [
              id,
              {
                state: "subscribed",
                startFrame,
                stopFrame,
              },
            ],
          ]),
        ),
      ),
  }),
);
