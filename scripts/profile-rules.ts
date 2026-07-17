import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const presets = new Map([
  ["core", "core.jsonc"],
  ["full", "full.jsonc"],
  ["web", "web.jsonc"],
  ["ts-type", "ts-type.jsonc"],
]);

type ParsedArgs = {
  readonly each: boolean;
  readonly exceptRules: readonly string[];
  readonly preset: string;
  readonly rules: readonly string[];
  readonly targets: readonly string[];
};

const usage = `Usage:
  npx tsx scripts/profile-rules.ts [--preset full|core|web|ts-type] [--rule name] [--except name] [--each] <path...>

Output:
  rule<TAB>status<TAB>elapsed_ms`;

function parseArgs(argv: readonly string[]): ParsedArgs {
  const rules: string[] = [];
  const exceptRules: string[] = [];
  const targets: string[] = [];
  let each = false;
  let preset = "full";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${usage}\n`);
      process.exit(0);
    }

    if (arg === "--each") {
      each = true;
      continue;
    }

    if (arg === "--preset") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value after --preset.");
      }
      preset = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--preset=")) {
      preset = arg.slice("--preset=".length);
      continue;
    }

    if (arg === "--rule") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value after --rule.");
      }
      rules.push(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--rule=")) {
      rules.push(arg.slice("--rule=".length));
      continue;
    }

    if (arg === "--except") {
      const value = argv[index + 1];
      if (!value) {
        throw new Error("Missing value after --except.");
      }
      exceptRules.push(value);
      index += 1;
      continue;
    }

    if (arg.startsWith("--except=")) {
      exceptRules.push(arg.slice("--except=".length));
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    }

    targets.push(arg);
  }

  if (!presets.has(preset)) {
    throw new Error(`Unknown preset: ${preset}`);
  }

  if (targets.length === 0) {
    throw new Error("Missing target path.");
  }

  return { each, exceptRules, preset, rules, targets };
}

function resolveBiomeBin(): string {
  const biomePackagePath = require.resolve("@biomejs/biome/package.json");
  const biomePackage = require(biomePackagePath);
  const biomeBinRelative =
    typeof biomePackage.bin === "string" ? biomePackage.bin : biomePackage.bin.biome;

  return path.resolve(path.dirname(biomePackagePath), biomeBinRelative);
}

function loadPresetPlugins(preset: string): string[] {
  const configPath = path.join(repoRoot, "configs", presets.get(preset)!);
  const config = JSON.parse(readFileSync(configPath, "utf8")) as { plugins?: string[] };

  return (config.plugins ?? []).map((pluginPath) =>
    pluginPath.replace(
      "./node_modules/@catenarycloud/linteffect/",
      `${repoRoot}/`,
    ),
  );
}

function ruleName(pluginPath: string): string {
  return path.basename(pluginPath, ".grit");
}

function runBiome(label: string, plugins: readonly string[], targets: readonly string[]): void {
  const tempDir = mkdtempSync(path.join(tmpdir(), "linteffect-profile-"));
  const configPath = path.join(tempDir, "biome.json");

  try {
    writeFileSync(configPath, `${JSON.stringify({ plugins }, null, 2)}\n`, "utf8");

    const startedAt = performance.now();
    const result = spawnSync(
      process.execPath,
      [
        resolveBiomeBin(),
        "lint",
        `--config-path=${configPath}`,
        "--reporter=summary",
        "--max-diagnostics=20",
        "--no-errors-on-unmatched",
        ...targets,
      ],
      { cwd: process.cwd(), encoding: "utf8" },
    );
    const elapsedMs = Math.round(performance.now() - startedAt);

    process.stdout.write(`${label}\t${result.status ?? 1}\t${elapsedMs}\n`);
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const presetPlugins = loadPresetPlugins(args.preset);
  const selectedPlugins =
    args.rules.length === 0
      ? presetPlugins.filter((pluginPath) => !args.exceptRules.includes(ruleName(pluginPath)))
      : presetPlugins.filter(
          (pluginPath) =>
            args.rules.includes(ruleName(pluginPath)) &&
            !args.exceptRules.includes(ruleName(pluginPath)),
        );

  if (selectedPlugins.length === 0) {
    throw new Error("No matching rules selected.");
  }

  process.stdout.write("rule\tstatus\telapsed_ms\n");

  if (args.each) {
    for (const pluginPath of selectedPlugins) {
      runBiome(ruleName(pluginPath), [pluginPath], args.targets);
    }
    return;
  }

  runBiome(
    args.rules.length === 0 ? args.preset : selectedPlugins.map(ruleName).join(","),
    selectedPlugins,
    args.targets,
  );
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n${usage}\n`);
  process.exit(1);
}
