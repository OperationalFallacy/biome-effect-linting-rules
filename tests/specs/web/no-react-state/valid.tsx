import React, { useId } from "react";

import { useAtomSuspense } from "@effect/atom-react";
import { Context, Effect, Layer, Queue, Stream } from "effect";
import { Atom } from "effect/reactivity";

type Dimension = "innerWidth" | "innerHeight";

class Viewport extends Context.Service<
  Viewport,
  { readonly dimension: (dimension: Dimension) => Stream.Stream<number> }
>()("example/Viewport") {
  static readonly layer = Layer.succeed(Viewport, {
    dimension: (dimension: Dimension) =>
      Stream.callback<number>((queue) =>
        Effect.acquireRelease(
          Effect.sync(() => {
            const update = () => Queue.offerUnsafe(queue, window[dimension]);
            window.addEventListener("resize", update);
            update();

            return update;
          }),
          (update) =>
            Effect.sync(() => window.removeEventListener("resize", update)),
        ),
      ),
  });
}

const viewportRuntime = Atom.runtime(Viewport.layer);
const viewportDimensionAtom = Atom.family((dimension: Dimension) =>
  viewportRuntime.atom(
    Stream.unwrap(
      Effect.map(Viewport, (viewport) => viewport.dimension(dimension)),
    ),
  ),
);

const viewportLabelAtom = Atom.make((get) =>
  Effect.gen(function* () {
    const width = yield* get.result(viewportDimensionAtom("innerWidth"));
    const height = yield* get.result(viewportDimensionAtom("innerHeight"));

    return `${width} × ${height}`;
  }),
);

/**
 * ViewportSize displays the browser viewport dimensions and updates after
 * a resize. The Viewport service registers listeners and releases them when
 * the atom streams close. A derived atom formats the dimensions as a label,
 * which the component reads through useAtomSuspense. This requires a browser
 * and a surrounding Suspense boundary for the initial stream values.
 */
export function ViewportSize() {
  const outputId = useId();
  // It correctly reads the completed label from a derived atom.
  const label = useAtomSuspense(viewportLabelAtom).value;

  return React.createElement("output", { id: outputId }, label);
}

// It correctly exposes atom hooks to consumers of the viewport module.
export { useAtomSet, useAtomValue } from "@effect/atom-react";
