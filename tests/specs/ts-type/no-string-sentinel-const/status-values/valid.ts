import { Data } from "effect";

const LoadState = Data.taggedEnum<{
  Loading: {};
  Ready: { readonly count: number };
}>();
const state = LoadState.Ready({ count: 3 });
