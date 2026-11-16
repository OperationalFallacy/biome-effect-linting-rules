import { Array as Arr, Option } from "effect";

const profiles = [{ id: "guest-1", name: "Mira" }];

/**
 * findProfile searches guest profiles by id. profileName displays the stored
 * name or "Guest" when no profile matches. The lookup preserves Option.none
 * for absence, as the preset requires, so its consumer can compose name
 * selection and the fallback directly.
 */
export const findProfile = (id: string) =>
  // It correctly preserves absence as Option.none.
  Arr.findFirst(profiles, (profile) => profile.id === id);

export const profileName = (id: string) =>
  findProfile(id).pipe(
    Option.map((profile) => profile.name),
    Option.getOrElse(() => "Guest"),
  );
