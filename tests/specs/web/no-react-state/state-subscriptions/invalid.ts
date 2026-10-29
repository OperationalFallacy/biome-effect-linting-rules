import { createElement, useState } from "react";

/**
 * Questionably owns the canonical count in a component-local hook.
 * Other views cannot subscribe to the value updated by this button.
 */
export function Count() {
  const [count, setCount] = useState(0);
  return createElement(
    "button",
    {
      type: "button",
      onClick: () => setCount((current) => current + 1),
    },
    count,
  );
}
