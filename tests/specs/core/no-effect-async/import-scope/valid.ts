import { setTimeout } from "node:timers";

const Effect = {
  async: <A>(register: (resume: (value: A) => void) => void) =>
    new Promise<A>((resolve) => register(resolve)),
};

/**
 * Correctly uses a local Promise-based bridge outside Effect composition.
 * Its callback completes with a plain value.
 */
export const registration = Effect.async((resume) => {
  setTimeout(() => resume(3), 0);
});
export const genericRegistration = Effect.async<number>((resume) => {
  setTimeout(() => resume(3), 0);
});
