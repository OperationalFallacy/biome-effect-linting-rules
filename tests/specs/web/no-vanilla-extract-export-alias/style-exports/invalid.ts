import { style } from "@vanilla-extract/css";

/**
 * Questionably exports aliases for generated classes. Consumers must follow
 * another declaration to find each style, and an exported base adds a second
 * public name for the same class.
 */
const panelBase = style({ width: "100%" });
export const panel = panelBase;

export const headingBase = style({ fontWeight: 600 });
export const heading = headingBase;

/**
 * Correctly composes a new class with style. This declaration adds styles
 * and produces its own class name.
 */
export const compactPanel = style([panelBase, { minWidth: 0 }]);

/**
 * Correctly exports ordinary metadata without another class-name alias.
 */
export const metadata = "panel";
