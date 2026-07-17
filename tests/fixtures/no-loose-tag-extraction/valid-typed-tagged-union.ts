import { Data, Match } from "effect";

type Failure = Data.TaggedEnum<{
  NotFound: { readonly id: string };
  Unavailable: { readonly retryAfter: number };
}>;

const Failure = Data.taggedEnum<Failure>();

const failureTag = Match.type<Failure>().pipe(
  Match.tagsExhaustive({
    NotFound: ({ _tag }) => _tag,
    Unavailable: ({ _tag }) => _tag,
  }),
);

export { Failure, failureTag };
