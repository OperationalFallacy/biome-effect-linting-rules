import path from "node:path";
import { describe, expect, it } from "vitest";
import { fixtureRoot, lintWithRule } from "./ruleTestHarness";

const fixtures = fixtureRoot("no-storybook-inline-test-harness");
const ruleName = "no-storybook-inline-test-harness";

describe(ruleName, () => {
  it.each([
    "invalid-play.stories.tsx",
    "invalid-inline-style.stories.tsx",
    "invalid-state-harness.stories.tsx",
  ])("It rejects inline Storybook test and presentation harnesses in %s", (fixture) => {
    const result = lintWithRule(ruleName, path.join(fixtures, fixture));

    expect(result.status).toBe(1);
    expect(result.output).toContain("keep Storybook stories declarative");
  });

  it("It allows a story that presents one typed static state", () => {
    const result = lintWithRule(
      ruleName,
      path.join(fixtures, "valid-static-state.stories.tsx"),
    );

    expect(result.status).toBe(0);
  });
});
