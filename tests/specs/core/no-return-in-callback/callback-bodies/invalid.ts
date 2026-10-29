import { Array as Arr } from "effect";

const names = [" Mira ", "Owen"];

/**
 * Questionably uses a named function with a single return for a transformation.
 * An expression callback can state the transformation directly at the call site.
 */
export const trimmed = names.map(function trim(name) {
  return name.trim();
});

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
