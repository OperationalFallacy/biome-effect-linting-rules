import { Atom } from "@effect-atom/atom-react";

export const eventHistoryCollectionAtom = Atom.make((get) => ({
  rows: [],
  keys: [],
  nextToken: null,
}));

export const eventHistoryCountAtom = Atom.make((get) => {
  const collection = get(eventHistoryCollectionAtom);
  return collection.rows.length;
});
