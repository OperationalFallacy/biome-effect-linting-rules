import { Array as Arr } from "effect";

const names = [" Mira ", "Owen"];

/**
 * Correctly uses an expression callback for a direct transformation.
 */
export const trimmed = names.map((name) => name.trim());

/**
 * Correctly retains a function body with a local normalized value.
 * The callback performs separate steps inside its own scope.
 */
export const labels = Arr.map(names, function normalize(name) {
  const normalized = name.trim();
  return normalized.toUpperCase();
});

/**
 * Correctly retains a function that reads its own arguments. An arrow callback
 * would capture the enclosing function's arguments instead.
 */
export const originalNames = names.map(function current(_name) {
  return arguments[0];
});

/**
 * Correctly retains the dynamic this binding supplied to a native array callback.
 */
export const prefixed = names.map(
  function label(this: { prefix: string }, name) {
    return `${this.prefix}: ${name.trim()}`;
  },
  { prefix: "Guest" },
);
