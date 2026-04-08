import { oxlintRules } from "../compat/ported-rules.mjs";

export const oxlintRecommendedRules = Object.fromEntries(
  oxlintRules.map((definition) => [
    `linteffect/${definition.name}`,
    definition.severity === "error" ? "error" : "warn",
  ]),
);

export const oxlintRecommended = {
  jsPlugins: ["@catenarycloud/linteffect/oxlint-plugin"],
  rules: oxlintRecommendedRules,
};

export default oxlintRecommended;
