import { Atom } from "@effect-atom/atom-react";

export const eventHistorySourceAtom = Atom.make((get) => ({
  rows: [],
  nextToken: null,
}));

export const eventSourceRowsByKeyAtom = Atom.make((get) => {
  const source = get(eventHistorySourceAtom);
  return new Map(source.rows.map((row) => [row.key, row]));
});

export const eventSourceRowIndexAtom = Atom.make((get) => {
  const source = get(eventHistorySourceAtom);
  return new Map(source.rows.map((row) => [row.key, row]));
});

export const eventSourceRowAtom = Atom.family((key: string) =>
  Atom.make((get) => {
    const rowsByKey = get(eventSourceRowsByKeyAtom);
    const rowIndex = get.get(eventSourceRowIndexAtom);
    return rowsByKey.get(key) ?? rowIndex.get(key);
  }),
);
