import { style } from "@vanilla-extract/css";

/**
 * Questionably creates a heading class with no styling role. Its declaration
 * adds another dependency for consumers without defining a visual property.
 */
export const heading = style({});

/**
 * Correctly gives a class a concrete role by resetting its default margin.
 */
export const panel = style({ margin: 0 });
