import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { repoRoot } from "./ruleTestHarness";

const load = (file: string) => JSON.parse(fs.readFileSync(path.join(repoRoot, file), "utf8"));

describe("Preset contracts", () => {
  it("It allows the full preset and root config to contain the union of smaller presets", () => {
    const smaller = ["core", "web", "ts-type"].flatMap((name) => load(`configs/${name}.jsonc`).plugins);
    const full = load("configs/full.jsonc").plugins;
    expect([...full].sort()).toEqual([...new Set(smaller)].sort());
    expect(load("biome.jsonc").plugins).toEqual(full);
    expect(new Set(full).size).toBe(full.length);
  });

  it("It allows every registered plugin to resolve to a packaged rule", () => {
    const prefix = "./node_modules/@catenarycloud/linteffect/";
    for (const preset of ["core", "web", "ts-type", "full"]) {
      for (const plugin of load(`configs/${preset}.jsonc`).plugins) {
        expect(plugin.startsWith(prefix)).toBe(true);
        expect(fs.existsSync(path.join(repoRoot, plugin.slice(prefix.length)))).toBe(true);
      }
    }
  });
});
