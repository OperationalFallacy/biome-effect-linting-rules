import { useAtomValue } from "@effect/atom-react";

export function Profile() {
  const profile = useAtomValue(profileAtom);
  return <span>{profile.name}</span>;
}
