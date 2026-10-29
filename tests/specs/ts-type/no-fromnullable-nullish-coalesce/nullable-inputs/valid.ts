import { Option } from "effect";

const displayName = Option.fromNullishOr(input).pipe(
  Option.getOrElse(() => "Anonymous"),
);
