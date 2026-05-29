import { Effect } from "effect";

interface User {
  readonly id: string;
  readonly name: string;
}

declare const raw: unknown;

const user = raw as User;

export const program = Effect.succeed(user.id);
