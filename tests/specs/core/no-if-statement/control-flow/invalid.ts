import { Effect } from "effect";

function valueBranchChoose(flag) {
  if (flag) {
    return 1;
  }
  return 0;
}

const operationBranchChoose = Effect.fn("choose")(function* (flag) {
  if (flag) {
    return 1;
  }
  return 0;
});
