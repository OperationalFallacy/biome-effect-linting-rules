import { Effect } from "effect";

const opaqueSyncCallValue = Effect.sync(() => update());

const namedEffectOperationValue = Effect.log("updated");
