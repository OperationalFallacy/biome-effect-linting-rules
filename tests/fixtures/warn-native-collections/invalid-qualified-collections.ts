import { Data } from "effect";

const itemKey = (id: string) => Data.struct({ id });
export const index = new globalThis.Map<ReturnType<typeof itemKey>, number>();
export const selected = new globalThis.Set<ReturnType<typeof itemKey>>();
