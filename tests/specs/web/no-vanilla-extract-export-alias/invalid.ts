import { style } from "@vanilla-extract/css";

/**
 * The exported aliases incorrectly give generated classes additional names.
 * The panel alias requires another declaration to find its styles, and the
 * heading exports expose two public names for the same class.
 */
const panelBase = style({ width: "100%" });
export const panel = panelBase;

export const headingBase = style({ fontWeight: 600 });
export const heading = headingBase;

/**
 * The compact class correctly composes additional styles with the base class.
 * It produces a new styled class instead of another exported name for the
 * same one.
 */
export const compactPanel = style([panelBase, { minWidth: 0 }]);

/**
 * The metadata correctly remains a text value describing the panel.
 * It does not create an additional public name for a generated CSS class.
 */
export const metadata = "panel";
