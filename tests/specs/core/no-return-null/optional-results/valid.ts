import { Array as Arr } from "effect";

const profiles = [{ id: "guest-1", name: "Mira" }];

/**
 * Correctly exposes absence through the lookup's Option result. Callers can
 * compose another optional operation without inventing a sentinel convention.
 */
export const findProfile = (id: string) =>
  Arr.findFirst(profiles, (profile) => profile.id === id);
