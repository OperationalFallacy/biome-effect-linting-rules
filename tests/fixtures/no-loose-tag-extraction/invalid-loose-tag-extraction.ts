const hasLooseTag = (
  value: unknown,
): value is { readonly _tag: string } =>
  typeof value === "object" &&
  value !== null &&
  "_tag" in value &&
  typeof value._tag === "string";

export { hasLooseTag };
