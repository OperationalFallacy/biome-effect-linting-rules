import { Schema } from "effect";

const decodeCount = Schema.decodeUnknownEffect(Schema.Int);

/**
 * readCount correctly returns the decoding Effect as its complete operation.
 * The input and decoder stay together without an extra generator scope.
 */
// It correctly returns the decoding Effect without another generator.
export const readCount = (input: unknown) => decodeCount(input);
