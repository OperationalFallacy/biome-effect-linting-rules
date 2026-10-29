const style = (definition: { readonly width: string }) => definition;
const base = style({ width: "100%" });

/**
 * Correctly aliases an ordinary local function's result. A module-name string
 * does not make this code a Vanilla Extract stylesheet.
 */
export const alias = base;
export const moduleName = "@vanilla-extract/css";
