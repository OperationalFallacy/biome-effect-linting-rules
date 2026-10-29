import { style } from "@vanilla-extract/css";

/**
 * Correctly exports each generated class from its style declaration.
 * Consumers have one public name for each style.
 */
export const panel = style({ width: "100%" });
export const heading = style({ fontWeight: 600 });

/**
 * Correctly composes a new class from an existing class and additional styles.
 */
export const compactPanel = style([panel, { minWidth: 0 }]);

/**
 * Correctly exports ordinary metadata without another class-name alias.
 */
export const metadata = "panel";
