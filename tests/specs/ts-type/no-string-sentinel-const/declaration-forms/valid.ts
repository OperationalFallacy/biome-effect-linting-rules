import { Data } from "effect";

type LoadState = Data.TaggedEnum<{
  Loading: {};
  Ready: { readonly count: number };
}>;
const LoadState = Data.taggedEnum<LoadState>();
type RequestPhase = Data.TaggedEnum<{ Pending: {} }>;
const RequestPhase = Data.taggedEnum<RequestPhase>();
type RequestOutcome = Data.TaggedEnum<{ Failed: { readonly cause: Error } }>;
const RequestOutcome = Data.taggedEnum<RequestOutcome>();
type RetryStatus = Data.TaggedEnum<{ Scheduled: { readonly delay: number } }>;
const RetryStatus = Data.taggedEnum<RetryStatus>();

/**
 * Correctly keeps workflow states and their data in tagged domain values.
 * The representation is consistent across typed, exported, and grouped declarations.
 */
const status = LoadState.Ready({ count: 3 });
const loadState: LoadState = LoadState.Loading();
export const requestPhase = RequestPhase.Pending();
const request_outcome = RequestOutcome.Failed({
    cause: new Error("Request failed"),
  }),
  retryStatus = RetryStatus.Scheduled({ delay: 100 });

export const states = {
  status,
  loadState,
  requestPhase,
  request_outcome,
  retryStatus,
};
