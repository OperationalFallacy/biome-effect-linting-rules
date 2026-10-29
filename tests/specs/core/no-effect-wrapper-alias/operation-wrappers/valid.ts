import { Effect } from "effect";

const loadUserName = Effect.fn("loadUserName")((id: string) =>
  repository.findUser(id).pipe(Effect.map((user) => user.name)),
);
