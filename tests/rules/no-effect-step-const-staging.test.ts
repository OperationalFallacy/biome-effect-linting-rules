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
  const rulePath = path.join(repoRoot, "rules", "no-effect-step-const-staging.grit");

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

const diagnosticMessage = "Rule: avoid Effect-step const staging.";

describe("no-effect-step-const-staging", () => {
  it("It catches Effect steps staged in local consts", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "invalid-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches Effect pipelines staged in local consts", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "invalid-pipe-effect-step-const-staging.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It allows continuous Effect pipelines without intermediate step consts", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "valid-effect-step-continuous-flow.ts"),
    );

    expect(result.status).toBe(0);
  });
});
