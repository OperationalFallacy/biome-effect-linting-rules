import { Data } from "effect";

const originalData = Data;

function makeIndex(Data: { struct: (input: string) => string }) {
  const scalarKey = (input: string) => Data.struct(input);
  return new Map<ReturnType<typeof scalarKey>, number>();
}
