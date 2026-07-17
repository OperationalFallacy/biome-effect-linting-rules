import { Option } from "effect";

// Derailment: a handwritten predicate interprets unknown input as application data.
const renderCandidate = (candidate: unknown) =>
  Option.liftPredicate(
    (value: unknown): value is string => typeof value === "string",
  )(candidate);

export { renderCandidate };
