import { Record, Ref, Struct } from "effect";

const setName = (id: string, name: string) =>
  Ref.update(state, Struct.evolve({ names: Record.set(id, name) }));
