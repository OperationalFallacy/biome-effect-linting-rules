import { Option } from "effect";

const name = Option.some("Mira");

/**
 * Correctly uses Option.map for explicit result-producing callbacks.
 * The transformation preserves absence when the input is Option.none.
 */
export const availability = Option.map(() => true);
export const available = Option.map(name, () => true);
export const genericAvailability = Option.map<unknown, boolean>(() => true);
export const presentAvailability = Option.some("Mira").pipe(
  Option.map(() => true),
);
export const mappedAvailability = name.pipe(Option.map(() => true));
