import { HashMap, HashSet } from "effect";

const profiles = HashMap.make([{ id: 1 }, profile]);
const selected = HashSet.make({ id: 1 });
const labels = new Map<string, string>();
const visited = new Set<number>();
