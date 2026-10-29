import { Option } from "effect";

const nullFallback = Option.fromNullishOr(input ?? null);
const undefinedFallback = Option.fromNullishOr(input ?? undefined);
const direct = Option.fromNullishOr(input);
