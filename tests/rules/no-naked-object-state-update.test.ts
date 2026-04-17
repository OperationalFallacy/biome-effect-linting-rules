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
  "no-naked-object-state-update",
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
  const rulePath = path.join(repoRoot, "rules", "no-naked-object-state-update.grit");

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

describe("no-naked-object-state-update", () => {
  it("It catches spread-based Ref.update patching", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-spread.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "Rule: avoid naked JS state patching/rebuild and raw JSON shortcuts in Effect transitions.",
    );
  });

  it("It catches Object.fromEntries/Object.entries rebuild pipelines", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-from-entries.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "Rule: avoid naked JS state patching/rebuild and raw JSON shortcuts in Effect transitions.",
    );
  });

  it("It catches Object.assign patch style in state transitions", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-object-assign.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "Rule: avoid naked JS state patching/rebuild and raw JSON shortcuts in Effect transitions.",
    );
  });

  it("It catches JSON.parse/JSON.stringify in transition execution flow", () => {
    const result = lintWithRule(path.join(fixtureRoot, "invalid-json-transition.ts"));
    expect(result.status).toBe(1);
    expect(result.output).toContain(
      "Rule: avoid naked JS state patching/rebuild and raw JSON shortcuts in Effect transitions.",
    );
  });

  it("It allows declarative EffectRecord + schema reconstruction", () => {
    const result = lintWithRule(path.join(fixtureRoot, "valid-effect-record-set.ts"));
    expect(result.status).toBe(0);
  });
});
