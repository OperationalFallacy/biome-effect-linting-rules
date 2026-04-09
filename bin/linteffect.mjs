#!/usr/bin/env node

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const presetFiles = {
  core: "core.jsonc",
  web: "web.jsonc",
  "ts-type": "ts-type.jsonc",
  full: "full.jsonc",
};

const helpText = `lintEffect CLI

Usage:
  npx @catenarycloud/linteffect check <path...> [--preset=<name>]
  npx @catenarycloud/linteffect rewrite <path...> [--preset=<name>]

Commands:
  check        Run Biome lint with the shipped lintEffect rules.
  rewrite      Run Biome lint --write with the shipped lintEffect rules.

Options:
  --preset=<name>   One of: full, core, web, ts-type. Default: full
  --help            Print this help text.
`;

function fail(message) {
  console.error(message);
  process.exit(1);
}

function printHelp() {
  process.stdout.write(`${helpText}\n`);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;

  if (!command || command === "help" || command === "--help" || command === "-h") {
    return { help: true };
  }

  if (command !== "check" && command !== "rewrite") {
    fail(`Unknown command "${command}". Use "check" or "rewrite".`);
  }

  const parsed = {
    command,
    preset: "full",
    targets: [],
  };

  // Parse only the CLI contract here. Everything else stays a direct Biome flag passthrough.
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];

    if (arg === "--help" || arg === "-h") {
      return { help: true };
    }

    if (arg === "--preset") {
      const value = rest[index + 1];
      if (!value) {
        fail("Missing value after --preset.");
      }
      parsed.preset = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--preset=")) {
      parsed.preset = arg.slice("--preset=".length);
      continue;
    }

    if (arg.startsWith("-")) {
      fail(`Unknown option "${arg}". Only --preset and --help are supported.`);
    }

    parsed.targets.push(arg);
  }

  if (!(parsed.preset in presetFiles)) {
    fail(
      `Unknown preset "${parsed.preset}". Use one of: ${Object.keys(presetFiles).join(", ")}.`,
    );
  }

  if (parsed.targets.length === 0) {
    fail("Missing target path. Pass one or more files or directories.");
  }

  return parsed;
}

async function loadPresetConfig(presetName) {
  const presetPath = path.join(packageRoot, "configs", presetFiles[presetName]);
  const presetConfig = JSON.parse(await readFile(presetPath, "utf8"));
  const packagePrefix = "./node_modules/@catenarycloud/linteffect/";

  // The published preset targets repo-local node_modules. The CLI must rewrite that to package-local absolute rule paths.
  const plugins = (presetConfig.plugins ?? []).map((pluginPath) => {
    if (typeof pluginPath !== "string") {
      fail(`Unsupported plugin entry in ${presetFiles[presetName]}.`);
    }

    if (!pluginPath.startsWith(packagePrefix)) {
      return pluginPath;
    }

    return path.join(packageRoot, pluginPath.slice(packagePrefix.length));
  });

  return {
    ...presetConfig,
    plugins,
  };
}

function resolveBiomeBin() {
  const biomePackagePath = require.resolve("@biomejs/biome/package.json");
  const biomePackage = require(biomePackagePath);
  const biomeBinRelative =
    typeof biomePackage.bin === "string" ? biomePackage.bin : biomePackage.bin.biome;

  return path.resolve(path.dirname(biomePackagePath), biomeBinRelative);
}

async function run() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    printHelp();
    return;
  }

  const config = await loadPresetConfig(parsed.preset);
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "linteffect-"));
  const configPath = path.join(tempDir, "biome.json");
  const biomeBin = resolveBiomeBin();
  const biomeCommand = ["lint"];

  if (parsed.command === "rewrite") {
    biomeCommand.push("--write");
  }

  biomeCommand.push(`--config-path=${configPath}`);
  biomeCommand.push(...parsed.targets);

  try {
    await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);

    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [biomeBin, ...biomeCommand], {
        cwd: process.cwd(),
        stdio: "inherit",
      });

      child.on("error", reject);
      child.on("exit", (code, signal) => {
        if (signal) {
          reject(new Error(`Biome exited with signal ${signal}.`));
          return;
        }

        resolve(code ?? 1);
      });
    });

    process.exit(exitCode);
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

run().catch(async (error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
