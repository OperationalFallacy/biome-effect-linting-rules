import * as React from "react";
import ReactDefault, {
  createElement,
  useId,
  // It incorrectly imports a React effect as the subscription lifecycle.
  useLayoutEffect as useSubscription,
  useMemo as memoize,
  // It incorrectly imports useState under the name useLocalState.
  useState as useLocalState,
} from "react";

/**
 * ViewportSize displays the browser viewport dimensions and updates after
 * a resize. It requires a browser. React state stores the dimensions, layout
 * effects manage listeners, and memo hooks cache the label. React supports
 * these APIs, but the preset requires service-managed subscriptions and a
 * derived atom for the label so the component only reads its prepared value.
 */
export function ViewportSize() {
  const outputId = useId();
  // It incorrectly keeps the browser-read callback in React.useCallback.
  const readWidth = ReactDefault.useCallback(() => window.innerWidth, []);
  const [width, setWidth] = useLocalState(readWidth);
  // It incorrectly stores viewport height in React.useState.
  const [height, setHeight] = React.useState<number>(window.innerHeight);

  useSubscription(() => {
    const updateWidth = () => setWidth(readWidth());
    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, [readWidth]);

  // It incorrectly accesses the subscription hook through the React namespace.
  React.useLayoutEffect(() => {
    const updateHeight = () => setHeight(window.innerHeight);
    window.addEventListener("resize", updateHeight);
    updateHeight();

    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // It incorrectly derives the label through a React memo hook.
  const label = memoize(() => `${width} × ${height}`, [width, height]);

  return createElement("output", { id: outputId }, label);
}

/**
 * The viewport module re-exports React state and synchronization APIs.
 * The preset requires consumers to use atom hooks, so these implementation
 * APIs must remain inside the adapter.
 */
// It incorrectly re-exports React APIs for application state and synchronization.
export {
  createContext,
  createRef,
  use,
  useActionState,
  useContext,
  useEffect,
  useEffectEvent,
  useImperativeHandle,
  useInsertionEffect,
  useOptimistic,
  useReducer,
  useRef,
  useSyncExternalStore,
} from "react";
