/**
 * Effect state services are useful for values that change across executions.
 * This description is a fresh value derived from a readonly input, so it can
 * remain a pure function.
 */
export const describe = (input: { readonly value: number }) => ({
  let: "let value = 1",
  var: "var value = 1",
  text: "if for while switch try throw ++",
  equal: input.value === 1,
  different: input.value !== 0,
});
