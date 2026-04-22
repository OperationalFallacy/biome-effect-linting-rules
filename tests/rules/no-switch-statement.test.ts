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
  "no-switch-statement",
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
  const rulePath = path.join(repoRoot, "rules", "no-switch-statement.grit");

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

const diagnosticMessage = "Rule: avoid imperative switch branching.";

describe("no-switch-statement", () => {
  it("It catches switch statements in files that import from 'effect'", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-switch.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches switch statements in files that import from 'effect/<module>'", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "invalid-switch-submodule-import.ts"),
    );
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It catches switch statements in files that import from '@effect-atom/atom-react'", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-switch-atom-react.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(diagnosticMessage);
  });

  it("It allows Match.value pipelines in place of a switch", () => {
    const result = lintWithRule(path.join(fixtureRoot, "valid-match-value.ts"));
    expect(result.status).toBe(0);
  });

  it("It allows switch statements in files without an Effect-ecosystem import", () => {
    const result = lintWithRule(
      path.join(fixtureRoot, "valid-switch-without-effect.ts"),
    );
    expect(result.status).toBe(0);
  });
});
