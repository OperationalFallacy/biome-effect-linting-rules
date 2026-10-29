import { Option } from "effect";

const findProfile = (id: string) =>
  profiles.pipe(Option.filter((profile) => profile.id === id));
