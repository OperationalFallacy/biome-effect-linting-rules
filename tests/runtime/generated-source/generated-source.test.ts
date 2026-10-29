import {
  Array as Arr,
  Effect,
  FileSystem,
  Layer,
  ManagedRuntime,
  Path,
} from "effect";
import { afterAll, describe, expect, it } from "vitest";

import { NodeFileSystem, NodePath } from "@effect/platform-node-shared";

import { Biome } from "../../../src/biome";

const runtime = ManagedRuntime.make(
  Biome.layer.pipe(
    Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
  ),
);
afterAll(() => runtime.dispose());

const fields = Arr.makeBy(
  24,
  (index) => `readonly field${index}: string;`,
).join("\n");
const values = Arr.makeBy(24, (index) => `field${index}: "value",`).join("\n");
const definitions = Arr.makeBy(
  600,
  (index) => `
export interface Entry${index} { ${fields} }
export const Entry${index} = { ${values} } as const;
`,
).join("\n");
const source = `import type { Effect } from "effect";\n${definitions}`;

const cases = [
  {
    title:
      "It catches a model assertion without rescanning unrelated definitions",
    rule: "no-model-overlay-cast",
    suffix: "\nconst input: unknown = {};\nconst model = input as Entry0;\n",
    errors: 1,
  },
  {
    title: "It allows large unrelated exports without stylesheet diagnostics",
    rule: "no-vanilla-extract-export-alias",
    suffix: "",
    errors: 0,
  },
];

describe("Generated source analysis", () => {
  it.each(cases)("$title", (entry) =>
    runtime.runPromise(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const biome = yield* Biome;
        const ruleFile = yield* path.fromFileUrl(
          new URL(`../../../rules/${entry.rule}.grit`, import.meta.url),
        );
        const content = yield* fs.readFileString(ruleFile);
        const started = performance.now();
        const result = yield* biome.lint({
          root: "/project",
          file: "/project/contracts.ts",
          source: source + entry.suffix,
          plugins: [{ path: `/project/rules/${entry.rule}.grit`, content }],
          configuration: {
            linter: { rules: { preset: "none" } },
            assist: { enabled: false },
          },
        });
        expect(performance.now() - started).toBeLessThan(20_000);
        expect(result.parseErrors).toBe(0);
        expect(result.skippedDiagnostics).toBe(0);
        expect(result.diagnostics).toHaveLength(entry.errors);
        expect(result.errors).toBe(entry.errors);
        if (entry.errors > 0) {
          const span = result.diagnostics[0]?.location.span;
          expect(span).toBeDefined();
          expect(
            new TextDecoder().decode(
              new TextEncoder()
                .encode(source + entry.suffix)
                .slice(span?.[0], span?.[1]),
            ),
          ).toBe("const model = input as Entry0");
        }
      }),
    ),
  );
});
