import { style } from "@vanilla-extract/css";
import { createElement } from "react";

/**
 * renderHeading displays a title with the browser's heading styles. The empty
 * heading class adds no styles, and the preset requires removal of that
 * unused declaration together with its className use. The panel's separate
 * margin reset remains in place.
 */
// It incorrectly exports an empty class used by renderHeading.
export const heading = style({});

export const panel = style({ margin: 0 });

export const renderHeading = (title: string) =>
  createElement("h2", { className: heading }, title);
