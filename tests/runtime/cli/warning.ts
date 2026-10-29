import { Data } from "effect";

class Key extends Data.Class<{ readonly id: string }> {}
const byKey = new Map<Key, string>();
