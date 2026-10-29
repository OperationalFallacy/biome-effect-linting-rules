import { pipe } from "effect";

{
  const nestedFreePipes = pipe(pipe(input, first), second);
}

{
  const nestedMethodPipes = input.pipe(first).pipe(second);
}

{
  const nestedTransforms = pipe(
    pipe(1, (n) => n + 1),
    (n) => n * 2,
  );
}

const linearPipeline = pipe(
  1,
  (n) => n + 1,
  (n) => n * 2,
);
