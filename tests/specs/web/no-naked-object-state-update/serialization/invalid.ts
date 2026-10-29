import { Effect, Schema } from "effect";

declare const book: { readonly title: string };
declare const write: (payload: string) => Effect.Effect<void>;
declare const read: () => Effect.Effect<string>;

const copyBook = Effect.gen(function* () {
  yield* write(JSON.stringify(book));
  const raw = yield* read();
  yield* write(JSON.stringify(JSON.parse(raw)));
});

const rawJsonValue = JSON.parse(input);

const schemaJsonValue = Schema.decodeUnknownEffect(
  Schema.fromJsonString(Schema.Struct({ id: Schema.String })),
)(input);
