import { Data, HashMap, HashSet } from "effect";

const itemKey = (id: string) => ({ id });
export const items = HashMap.empty<ReturnType<typeof itemKey>, string>();
export const selected = HashSet.empty<ReturnType<typeof itemKey>>();
export const values = new Map<string, ReturnType<typeof itemKey>>();
