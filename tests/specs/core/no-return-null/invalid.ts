import { Array as Arr, Option } from "effect";

const profiles = [{ id: "guest-1", name: "Mira" }];

/**
 * findProfile searches guest profiles by id. profileName displays the stored
 * name or "Guest" when no profile matches. The lookup converts Option.none
 * to null, so its consumer must restore the Option before display selection.
 * The preset requires Option for absent results.
 */
export const findProfile = (id: string) => {
  function absentProfile() {
    // It incorrectly returns null for a missing profile.
    return null;
  }

  return Arr.findFirst(profiles, (profile) => profile.id === id).pipe(
    Option.getOrElse(absentProfile),
  );
};

export const profileName = (id: string) =>
  Option.fromNullishOr(findProfile(id)).pipe(
    Option.map((profile) => profile.name),
    Option.getOrElse(() => "Guest"),
  );
