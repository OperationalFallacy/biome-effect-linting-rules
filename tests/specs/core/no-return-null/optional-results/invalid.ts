import { Array as Arr, Option } from "effect";

const profiles = [{ id: "guest-1", name: "Mira" }];

/**
 * Incorrectly unwraps an Option into a null sentinel. Callers lose the optional
 * value composition already provided by the lookup.
 */
export const findProfile = (id: string) => {
  const profile = Arr.findFirst(profiles, (profile) => profile.id === id);
  if (Option.isSome(profile)) {
    return profile.value;
  }
  return null;
};
