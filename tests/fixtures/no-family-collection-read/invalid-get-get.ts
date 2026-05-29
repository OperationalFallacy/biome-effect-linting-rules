import { Atom } from "@effect-atom/atom-react";

export const VisibleEventsAtom = Atom.make((get) => ({
  rows: [],
  keys: [],
}));

export const eventSourceRowAtom = Atom.family((key: string) =>
  Atom.make((get) => {
    const VisibleEvents = get.get(VisibleEventsAtom);
    return VisibleEvents.rows.find((row) => row.key === key);
  }),
);
