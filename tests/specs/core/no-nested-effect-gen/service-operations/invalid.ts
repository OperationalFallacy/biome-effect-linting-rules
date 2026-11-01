import { Effect, Schema } from "effect";

const decodeCount = Schema.decodeUnknownEffect(Schema.Int);

/**
 * Incorrectly nests a decoding generator inside another generator.
 * One operation's sequence is spread across two bodies.
 */
export const readCount = (input: unknown) =>
  Effect.gen(function* () {
    return yield* Effect.gen(function* () {
      return yield* decodeCount(input);
    });
  });

/**
 * Incorrectly names a nested generator only to yield it in the outer operation.
 */
export const readLocalCount = (input: unknown) =>
  Effect.gen(function* () {
    const fragment = Effect.gen(function* () {
      return yield* decodeCount(input);
    });
    return yield* fragment;
  });

/**
 * Incorrectly stages a nested generator inside an exposed API operation.
 * Returning the outer read operation does not combine its internal fragments.
 */
export const makeApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.gen(function* () {
      const fragment = Effect.gen(function* () {
        return yield* decodeCount(input);
      });
      return yield* fragment;
    });
    return { read };
  });

/**
 * Incorrectly hides an intermediate generator behind a shadowed operation name.
 */
export const makeShadowedApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.gen(function* () {
      const read = Effect.gen(function* () {
        return yield* decodeCount(input);
      });
      return yield* read;
    });
    return { read };
  });

/**
 * Questionably returns a locally staged generator behind a nested API wrapper.
 * Callers must traverse the wrapper to reach the operation.
 */
export const makeNestedApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return yield* decodeCount(input);
    });
    return { nested: { read } };
  });

/**
 * Correctly exposes a complete generator as a direct API operation.
 */
export const makeDirectApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return yield* decodeCount(input);
    });
    return { read };
  });

/**
 * Correctly exposes a complete operation through an explicit API member name.
 */
export const makeRenamedApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return yield* decodeCount(input);
    });
    return { load: read };
  });

/**
 * Correctly exposes an Effect.fn operation through its service API.
 */
export const makeCallableApi = (input: unknown) =>
  Effect.gen(function* () {
    const read = Effect.fn("read")(function* () {
      return yield* decodeCount(input);
    });
    return { read };
  });
