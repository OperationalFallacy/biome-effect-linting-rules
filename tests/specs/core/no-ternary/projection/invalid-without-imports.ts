/**
 * Match is a pure value transformation and needs no Effect runtime. Use it for
 * value decisions in ordinary collection callbacks as well as Effect operations.
 */
export const clamp = (values: ReadonlyArray<number>) =>
  values.map((value) => value < 0 ? 0 : value);
