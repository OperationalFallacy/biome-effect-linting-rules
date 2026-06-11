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
  const rulePath = path.join(repoRoot, "rules", "no-pipeline-fragment-staging.grit");

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

const diagnosticMessage = "Rule: avoid pipeline fragment staging.";

describe("no-pipeline-fragment-staging", () => {
  it("It catches local pipeline fragments consumed by returned pipelines", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "invalid-pipeline-fragment-return.ts"),
    );

    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It allows final domain values before continuous returned pipelines", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "valid-pipeline-final-domain-value.ts"),
    );

    expect(result.status).toBe(0);
  });

  it("It allows nested render callback composition inside result matching", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "valid-nested-render-callback-composition.tsx"),
    );

    expect(result.status).toBe(0);
  });
});
