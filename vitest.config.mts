import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Each worker loads its own WASM instance. Bound memory use in CI.
    maxWorkers: 2,
  },
});
