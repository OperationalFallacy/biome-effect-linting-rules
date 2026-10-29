/**
 * Questionably stores workflow states as independent text tokens across
 * declaration forms. Their data and allowed alternatives have no shared model.
 */
const status = "ready";
const loadState: string = "loading";
export const requestPhase = "pending";
const request_outcome = "failed",
  retryStatus = "scheduled";

export const states = {
  status,
  loadState,
  requestPhase,
  request_outcome,
  retryStatus,
};
