import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { oxlintRules } from "../compat/ported-rules.mjs";
import { oxlintRuleCases } from "./test-cases.mjs";

const repoRoot = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const oxlintBinary = path.join(
  repoRoot,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "oxlint.cmd" : "oxlint",
);
const pluginPath = path.join(repoRoot, "oxlint", "plugin.mjs");
const ruleSeverity = Object.fromEntries(
  oxlintRules.map((definition) => [
    definition.name,
    definition.severity === "error" ? "error" : "warn",
  ]),
);

function customCode(ruleName) {
  return `linteffect(${ruleName})`;
}

async function writeFixture(tmpPath, fixture) {
  const mainFile = path.join(tmpPath, fixture.filename ?? "sample.ts");
  await mkdir(path.dirname(mainFile), { recursive: true });
  await writeFile(mainFile, fixture.code, "utf8");

  for (const [relativePath, content] of Object.entries(fixture.files ?? {})) {
    const filePath = path.join(tmpPath, relativePath);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, content, "utf8");
  }

  return mainFile;
}

async function runOxlintRule(ruleName, fixture) {
  const tempDir = await mkdtemp(path.join(tmpdir(), "linteffect-oxlint-"));
  try {
    const targetFile = await writeFixture(tempDir, fixture);
    const configPath = path.join(tempDir, "oxlint.json");
    await writeFile(
      configPath,
      JSON.stringify({
        plugins: [],
        jsPlugins: [pluginPath],
        rules: {
          [`linteffect/${ruleName}`]: ruleSeverity[ruleName] ?? "error",
        },
      }),
      "utf8",
    );

    const result = await new Promise((resolve, reject) => {
      const child = spawn(
        oxlintBinary,
        ["-c", configPath, "-f", "json", targetFile],
        {
          cwd: tempDir,
          env: process.env,
          stdio: ["ignore", "pipe", "pipe"],
        },
      );

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (chunk) => {
        stdout += String(chunk);
      });
      child.stderr.on("data", (chunk) => {
        stderr += String(chunk);
      });
      child.on("error", reject);
      child.on("close", (code) => {
        resolve({ code, stdout, stderr });
      });
    });

    const parsed = JSON.parse(result.stdout);
    const diagnostics = (parsed.diagnostics ?? []).filter(
      (diagnostic) => diagnostic.code === customCode(ruleName),
    );

    return {
      code: result.code,
      diagnostics,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

test("oxlint rule cases cover every translated Oxlint rule", () => {
  const caseNames = oxlintRuleCases.map((ruleCase) => ruleCase.name).sort();
  const ruleNames = oxlintRules.map((definition) => definition.name).sort();
  assert.deepStrictEqual(caseNames, ruleNames);
});

for (const ruleCase of oxlintRuleCases) {
  test(ruleCase.name, async () => {
    for (const fixture of ruleCase.valid) {
      const result = await runOxlintRule(ruleCase.name, fixture);
      assert.equal(
        result.diagnostics.length,
        0,
        `${ruleCase.name} should ignore valid fixture.\n${result.stdout}\n${result.stderr}`,
      );
    }

    for (const fixture of ruleCase.invalid) {
      const result = await runOxlintRule(ruleCase.name, fixture);
      assert.equal(
        result.diagnostics.length,
        1,
        `${ruleCase.name} should report exactly one diagnostic.\n${result.stdout}\n${result.stderr}`,
      );
    }
  });
}
