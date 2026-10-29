import { Option } from "effect";

const name = Option.some("Mira");

/**
 * Questionably uses Option.as for result selection. This package favors
 * explicit result-producing callbacks in composition.
 */
export const availability = Option.as(true);
export const available = Option.as(name, true);
export const genericAvailability = Option.as<boolean>(true);
export const presentAvailability = Option.as(Option.some("Mira"), true);

/**
 * Correctly expresses result selection through an Option.map callback.
 */
export const mappedAvailability = name.pipe(Option.map(() => true));
