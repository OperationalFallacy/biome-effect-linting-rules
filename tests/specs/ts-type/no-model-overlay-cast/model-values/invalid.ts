import { Effect, Schema } from "effect";

const inputAssertionValue = input as {
  id: string;
};

interface User {
  readonly id: string;
  readonly name: string;
}

declare const raw: unknown;

const user = raw as User;

const namedTypeProgram = Effect.succeed(user.id);

const status = "open" as const;

const asConstLiteralProgram = Effect.succeed(status);

const DAY_TOKENS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

const first = Effect.succeed(DAY_TOKENS[0]);

const decodedInputValue = Schema.decodeUnknownEffect(Schema.Struct({ id: Schema.String }))(input);
