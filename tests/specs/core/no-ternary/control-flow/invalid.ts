import { Effect } from "effect";

const valueTernaryValue = flag ? 1 : 0;

const deferredDecisionValue = Effect.suspend(() => Effect.succeed(flag ? 1 : 0));
