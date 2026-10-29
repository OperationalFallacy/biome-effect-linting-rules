import { Effect } from "effect";
import { Atom, AtomRegistry } from "effect/reactivity";

{
  const readWithSync = Effect.sync(() => Atom.get(counter));
}

{
  const readWithSyncBlock = Effect.sync(() => {
    return Atom.get(counter);
  });
}

{
  const writeWithSync = Effect.sync(() => Atom.set(counter, 1));
}

{
  const writeWithSyncBlock = Effect.sync(() => {
    return Atom.set(counter, 1);
  });
}

{
  const updateWithSync = Effect.sync(() => Atom.update(counter, (n) => n + 1));
}

{
  const updateWithSyncBlock = Effect.sync(() => {
    return Atom.update(counter, (n) => n + 1);
  });
}

{
  const modifyWithSync = Effect.sync(() => Atom.modify(counter, (n) => [n, n + 1]));
}

{
  const modifyWithSyncBlock = Effect.sync(() => {
    return Atom.modify(counter, (n) => [n, n + 1]);
  });
}

{
  const refreshWithSync = Effect.sync(() => Atom.refresh(counter));
}

{
  const refreshWithSyncBlock = Effect.sync(() => {
    return Atom.refresh(counter);
  });
}

{
  const readDirectly = Atom.get(counter);
}

{
  const writeDirectly = Atom.set(counter, 1);
}

{
  const updateDirectly = Atom.update(counter, (n) => n + 1);
}

{
  const modifyDirectly = Atom.modify(counter, (n) => [n, n + 1]);
}

{
  const refreshDirectly = Atom.refresh(counter);
}

{
  const counter = Atom.make(0);
  const atomRegistry = AtomRegistry.make();
  const read = Effect.sync(() => atomRegistry.get(counter));
  const write = Effect.sync(() => {
    atomRegistry.set(counter, 1);
  });
}

{
  const deferredReadFunction = Effect.sync(() => () => Atom.get(counter));
}
