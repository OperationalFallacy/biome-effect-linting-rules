interface User {
  readonly id: string;
  readonly active: boolean;
}

/**
 * The isUser predicate incorrectly maintains structural validation beside a
 * separate User declaration. Its id and active checks can drift from that
 * declared type without TypeScript checking that they establish the model.
 */
// It incorrectly declares a model predicate through handwritten field checks.
export const isUser = (input: unknown): input is User =>
  typeof input === "object" &&
  input !== null &&
  "id" in input &&
  typeof input.id === "string" &&
  "active" in input &&
  typeof input.active === "boolean";
