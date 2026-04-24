import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureRoot = path.join(
  repoRoot,
  "tests",
  "fixtures",
  "no-model-overlay-cast",
);

function resolveBiomeBin() {
  const biomePackagePath = require.resolve("@biomejs/biome/package.json");
  const biomePackage = require(biomePackagePath);
  const biomeBinRelative =
    typeof biomePackage.bin === "string" ? biomePackage.bin : biomePackage.bin.biome;
  return path.resolve(path.dirname(biomePackagePath), biomeBinRelative);
}

function lintWithRule(fixtureFile: string) {
  const tempDir = mkdtempSync(path.join(tmpdir(), "linteffect-rule-test-"));
  const configPath = path.join(tempDir, "biome.json");
  const rulePath = path.join(repoRoot, "rules", "no-model-overlay-cast.grit");

  writeFileSync(configPath, `${JSON.stringify({ plugins: [rulePath] }, null, 2)}\n`, "utf8");

  try {
    const result = spawnSync(
      process.execPath,
      [
        resolveBiomeBin(),
        "lint",
        "--reporter=json",
        "--max-diagnostics=none",
        `--config-path=${configPath}`,
        fixtureFile,
      ],
      { cwd: repoRoot, encoding: "utf8" },
    );

    const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
    return {
      status: result.status ?? 1,
      output,
    };
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

describe("no-model-overlay-cast", () => {
  it("flags a genuine cast to a named type", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-named-type.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain("avoid `as` assertions on decoded model flow");
  });

  it("allows `as const` on a tuple literal", () => {
    const result = lintWithRule(path.join(fixtureRoot, "valid-as-const-tuple.ts"));
    expect(result.status).toBe(0);
  });

  it("allows `as const` on a primitive literal", () => {
    const result = lintWithRule(path.join(fixtureRoot, "valid-as-const-literal.ts"));
    expect(result.status).toBe(0);
  });
});
