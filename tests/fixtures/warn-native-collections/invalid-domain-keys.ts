import { Data } from "effect";

class Key extends Data.Class<{ readonly id: string }> {}

export const byKey = new Map<Key, string>([[new Key({ id: "a" }), "first"]]);
export const selected = new Set<Key>([new Key({ id: "a" })]);
