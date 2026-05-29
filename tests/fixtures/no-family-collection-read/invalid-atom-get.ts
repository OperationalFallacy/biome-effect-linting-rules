import { Atom } from "@effect-atom/atom-react";

export const searchResultsAtom = Atom.make((get) => ({
  rows: [],
  keys: [],
}));

export const searchResultRowAtom = Atom.family((key: string) =>
  Atom.make(() => {
    const results = Atom.get(searchResultsAtom);
    return results.rows.find((row) => row.key === key);
  }),
);
