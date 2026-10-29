import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";

import { Schema } from "effect";
import { describe, expect, it, vi } from "vitest";

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL("../../../", import.meta.url));
const nativeBin = path.join(
  path.dirname(require.resolve("@biomejs/biome/package.json")),
  "bin",
  "biome",
);

const constructorFixture = new URL("./mock.js", import.meta.url);
const Configuration = Schema.fromJsonString(
  Schema.Struct({
    plugins: Schema.Array(Schema.String),
    linter: Schema.Unknown,
  }),
);
const PluginPath = Schema.TemplateLiteralParser([
  "./node_modules/@catenarycloud/linteffect/",
  Schema.NonEmptyString,
]);

function loadFullPreset() {
  const configPath = path.join(root, "configs", "full.jsonc");
  const configuration = Schema.decodeUnknownSync(Configuration)(
    readFileSync(configPath, "utf8"),
  );

  return {
    plugins: configuration.plugins.map((plugin) => {
      const [, relative] = Schema.decodeUnknownSync(PluginPath)(plugin);
      return path.join(root, relative);
    }),
    linter: configuration.linter,
  };
}

describe("Constructor callbacks", () => {
  it.each([false, true])(
    "It allows constructor mocks after a full configured check with lint enabled %s",
    (enabled) => {
      const directory = mkdtempSync(
        path.join(tmpdir(), "linteffect-constructor-"),
      );
      const configPath = path.join(directory, "biome.json");
      const sourcePath = path.join(directory, "constructor.test.js");

      try {
        writeFileSync(
          configPath,
          Schema.encodeSync(Configuration)(loadFullPreset()),
        );
        writeFileSync(sourcePath, readFileSync(constructorFixture, "utf8"));

        const result = spawnSync(
          process.execPath,
          [
            nativeBin,
            "check",
            "--write",
            `--linter-enabled=${enabled}`,
            `--config-path=${directory}`,
            sourcePath,
          ],
          { encoding: "utf8" },
        );

        expect(result.status, result.stderr).toBe(0);

        const checkedSource = readFileSync(sourcePath, "utf8");
        const context = { vi, widget: undefined };
        runInNewContext(checkedSource, context);

        expect(context.widget).toEqual({ value: 1 });
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  );
});
