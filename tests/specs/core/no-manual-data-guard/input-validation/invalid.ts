interface User {
  readonly id: string;
  readonly active: boolean;
}

/**
 * Questionably duplicates model validation in a hand-written type predicate.
 * Callers must perform the check and handle rejection outside the Effect error channel.
 */
export const isUser = (input: unknown): input is User =>
  typeof input === "object" &&
  input !== null &&
  "id" in input &&
  typeof input.id === "string" &&
  "active" in input &&
  typeof input.active === "boolean";
