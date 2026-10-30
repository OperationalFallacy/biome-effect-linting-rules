import { Effect } from "effect";

export interface Writer {
  readonly write: Effect.Effect<void>;
}

export const writeWhen = Effect.fn("writeWhen")((enabled: boolean, writer: Writer) =>
  writer.write.pipe(Effect.when(Effect.succeed(enabled)), Effect.asVoid),
);
