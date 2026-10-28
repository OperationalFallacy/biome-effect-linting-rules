import { Effect } from "effect";
import { Atom } from "effect/reactivity";

const bookResultsAtom = Atom.make<readonly string[]>([]);

export const bookAtom = Atom.family((isbn: string) =>
  Atom.make(Effect.gen(function* () {
    const books = yield* Atom.get(bookResultsAtom);
    return books.find((book) => book === isbn);
  })),
);
