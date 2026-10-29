import { Data } from "effect";

export const defaultData = Data;

/**
 * Correctly uses a supplied scalar-producing API as a native collection key
 * factory. The local Data parameter's struct method returns a string.
 */
export function makeIndex(Data: { struct: (input: string) => string }) {
  const scalarKey = (input: string) => Data.struct(input);
  const index = new Map<ReturnType<typeof scalarKey>, number>();
  return { index, key: scalarKey };
}
