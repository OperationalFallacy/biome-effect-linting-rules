import { pipe } from "effect";

const wrapped = (() => 1)();
const composed = pipe(1, (count) => count + 1);
