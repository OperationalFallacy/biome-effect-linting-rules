import { Data } from "effect";

export const originalData = Data;

export function makeIndex(Data: { struct: (input: string) => string }) {
  const scalarKey = (input: string) => Data.struct(input);
  return new Map<ReturnType<typeof scalarKey>, number>();
}
