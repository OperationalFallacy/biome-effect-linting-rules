import { Data } from "effect";

export const itemKey = (group: string, id: number) => Data.struct({ group, id });

export const items = new Map<ReturnType<typeof itemKey>, string>();
export const selected = new Set<ReturnType<typeof itemKey>>();
