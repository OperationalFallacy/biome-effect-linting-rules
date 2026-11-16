import { style } from "@vanilla-extract/css";
import { createElement } from "react";

/**
 * renderHeading displays a title with the browser's heading styles. It omits
 * the empty class and its declaration as the preset requires. The heading's
 * styles stay the same, and the panel retains its separate margin reset.
 */
export const panel = style({ margin: 0 });

// It correctly renders the heading without an empty generated class.
export const renderHeading = (title: string) => createElement("h2", {}, title);
