import { Effect } from "effect";

export interface Writer {
  readonly write: Effect.Effect<void>;
}

export const writeWhen = Effect.fn("writeWhen")(function* (enabled: boolean, writer: Writer) {
  if (enabled) {
    yield* writer.write;
  }
});
