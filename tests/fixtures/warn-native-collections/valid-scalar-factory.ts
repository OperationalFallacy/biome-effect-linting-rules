import { Data } from "effect";

const keyString = (key: { id: string }) => key.id;
export const records = new Map<ReturnType<typeof keyString>, string>();
export const selected = new Set<ReturnType<typeof keyString>>();
export const view = { ready: true };
