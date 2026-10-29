import { Effect } from "effect";

const readName = readUser.pipe(Effect.map((user) => user.name));
const complete = saveUser.pipe(Effect.map(() => undefined));
