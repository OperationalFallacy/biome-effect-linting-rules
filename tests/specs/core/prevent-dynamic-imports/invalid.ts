import { Buffer } from "node:buffer";

import { Effect } from "effect";

/**
 * encodeState converts a value to V8 binary data and then base64 text for a
 * text storage column. The caller runs the returned Effect to obtain the text;
 * a serialization exception remains an Effect defect. This version loads the
 * fixed node:v8 dependency inside the operation. The preset requires a static
 * import so the module dependency is declared before the operation.
 */
export const encodeState = (value: unknown) =>
  Effect.promise(async () => {
    // It incorrectly loads the fixed node:v8 dependency with a dynamic import.
    const binary = await import("node:v8");
    return Buffer.from(binary.serialize(value)).toString("base64");
  });
