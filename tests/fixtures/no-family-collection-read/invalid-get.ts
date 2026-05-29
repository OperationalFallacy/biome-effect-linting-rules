import { Atom } from "@effect-atom/atom-react";

export const eventsHistoryCollectionAtom = Atom.make((get) => ({
  rows: [],
  keys: [],
  nextToken: null,
}));

export const eventSourceRowAtom = Atom.family((key: string) =>
  Atom.make((get) => {
    // Derailment: this single-row atom reads the whole collection atom to find one row.
    // Row lookup should read a keyed source or index atom instead.
    const collection = get(eventsHistoryCollectionAtom);
    return collection.rows.find((row) => row.key === key);
  }),
);
