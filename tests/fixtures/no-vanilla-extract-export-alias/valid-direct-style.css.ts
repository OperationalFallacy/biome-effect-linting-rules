import { style } from "@vanilla-extract/css";

const disclosureBase = style({ width: "100%" });

export const disclosure = style([disclosureBase, { minWidth: 0 }]);
export const metadata = "disclosure";
