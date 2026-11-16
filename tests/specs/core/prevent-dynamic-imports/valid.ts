import { Buffer } from "node:buffer";
// It correctly declares the fixed node:v8 dependency with a static import.
import { serialize } from "node:v8";

import { Effect } from "effect";

/**
 * encodeState converts a value to V8 binary data and then base64 text for a
 * text storage column. The caller runs the returned Effect to obtain the text;
 * a serialization exception remains an Effect defect. A static import declares
 * the fixed node:v8 dependency before the operation, as the preset requires.
 * Effect.sync still defers serialization until the caller runs the Effect.
 */
export const encodeState = (value: unknown) =>
  Effect.sync(() => {
    const bytes = serialize(value);
    return Buffer.from(bytes).toString("base64");
  });
