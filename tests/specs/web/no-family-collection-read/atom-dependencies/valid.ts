import { Atom } from "@effect/atom-react";

const userName = Atom.family((id: string) =>
  Atom.make((get) => get(userById(id)).name),
);
