import { style } from "@vanilla-extract/css";

/**
 * The classes correctly use their style declarations as their only exported
 * names. Consumers can identify each class and its definition without
 * following an alias.
 */
export const panel = style({ width: "100%" });
export const heading = style({ fontWeight: 600 });

/**
 * The compact class correctly adds its own styles to the panel class.
 * Vanilla Extract generates a new class for that composition.
 */
export const compactPanel = style([panel, { minWidth: 0 }]);

/**
 * The metadata correctly remains a text value describing the panel.
 * It does not create an additional public name for a generated CSS class.
 */
export const metadata = "panel";
