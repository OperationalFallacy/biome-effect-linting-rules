import { Result } from "effect";

const fieldDecisionsValue = {
  count: Result.match(result, { onSuccess: (n) => n, onFailure: () => 0 }),
};

const count = Result.match(result, {
  onSuccess: (n) => n,
  onFailure: () => 0,
});
const selectedFieldsValue = { count };
