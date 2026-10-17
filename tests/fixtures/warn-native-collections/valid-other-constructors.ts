import { Effect } from "effect";

declare const custom: { Map: new () => object; Set: new () => object };
export const index = new custom.Map();
export const selected = new custom.Set();
export const weakIndex = new WeakMap<object, string>();
export const weakSelected = new WeakSet<object>();
export const ready = Effect.succeed(true);
