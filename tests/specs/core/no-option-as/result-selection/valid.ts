import { Option } from "effect";

const displayName = user.pipe(Option.map((user) => user.name));
const available = user.pipe(Option.map(() => true));
