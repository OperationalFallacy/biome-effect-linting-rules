import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const fixtureRoot = path.join(repoRoot, "tests", "fixtures", "defragmentation");

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
  const rulePath = path.join(repoRoot, "rules", "no-fragmented-const-assembly.grit");

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

    return {
      status: result.status ?? 1,
      output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
    };
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

const diagnosticMessage = "Rule: avoid fragmented const assembly chains.";

describe("no-fragmented-const-assembly", () => {
  it("It catches direct const fragments used inside const function object assembly", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "invalid-direct-const-fragment.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches second-level const assembly chains", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-assembly-chain.ts"));

    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It allows Data tagged enum declarations and explicit final object contracts", () => {
    const result = lintWithRule(path.join(fixtureRoot, "valid-const-assembly.ts"));

    expect(result.status).toBe(0);
  });
});
