import { pipe } from "effect";

const request = pipe(input, decodeInput, selectRows, encodeRows);
