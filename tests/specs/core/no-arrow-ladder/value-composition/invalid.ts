import { pipe } from "effect";

const nestedInvocationsValue = ((a) => ((b) => b)(a))(1);

const valuePipelineValue = pipe(1, (n) => n + 1);
