import { Effect, pipe } from "effect";

const direct = rows.map((row) => { return row.name; });
const typed = rows.map((row): string => { return row.name; });
const short = rows.map(row => { return row.name; });
const transformed = Effect.map(readProfile, (profile) => { return profile.name; });
const piped = pipe(rows, (items) => { return items.length; });
