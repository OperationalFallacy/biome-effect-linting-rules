import { Effect, Schema } from "effect";

const decodeCount = Schema.decodeUnknownEffect(Schema.Int);

/**
 * Correctly defines the complete decoding operation without nested generator bodies.
 */
export const readCount = Effect.fn("readCount")((input: unknown) =>
  decodeCount(input),
);
export const readLocalCount = readCount;

/**
 * Correctly exposes the complete decoder as a direct API operation.
 */
export const makeApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = decodeCount(input);
    return { read };
  });
export const makeShadowedApi = makeApi;
export const makeDirectApi = makeApi;

/**
 * Correctly constructs a complete nested API value without staging a generator.
 */
export const makeNestedApi = (input: unknown) =>
  Effect.gen(function* () {
    return { nested: { read: decodeCount(input) } };
  });

/**
 * Correctly exposes a complete operation through an explicit API member name.
 */
export const makeRenamedApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = decodeCount(input);
    return { load: read };
  });

/**
 * Correctly exposes an Effect.fn operation through its service API.
 */
export const makeCallableApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.fn("read")(() => decodeCount(input));
    return { read };
  });
