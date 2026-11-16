import assert from "node:assert/strict";
import {
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../tests/specs/", import.meta.url));
const walk = (directory) =>
  readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
const ruleDirectories = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .flatMap((group) =>
    readdirSync(join(root, group.name), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((rule) => join(root, group.name, rule.name)),
  );
const rules = ruleDirectories.filter((rule) => walk(rule).length > 0);

// Keep the shortest existing pair from the same directory without merging examples.
const plans = rules.map((rule) => {
  const sources = walk(rule).filter((file) => /\.tsx?$/.test(file));
  const pairs = sources
    .filter((file) => /^invalid\.tsx?$/.test(basename(file)))
    .flatMap((invalid) =>
      sources
        .filter(
          (valid) =>
            dirname(valid) === dirname(invalid) &&
            /^valid\.tsx?$/.test(basename(valid)),
        )
        .map((valid) => [invalid, valid]),
    )
    .sort(
      (left, right) =>
        left.reduce((size, file) => size + statSync(file).size, 0) -
          right.reduce((size, file) => size + statSync(file).size, 0) ||
        left[0].localeCompare(right[0]),
    );
  assert(pairs.length > 0, `No existing valid/invalid pair in ${rule}`);

  const kept = pairs[0].flatMap((file) => {
    const source = readFileSync(file, "utf8");
    assert(
      !/(?:from\s*|import\s*\()(["'])\./.test(source),
      `Cannot move a fixture with relative imports: ${file}`,
    );
    const snapshot = readFileSync(`${file}.snap`, "utf8");

    return [
      { name: basename(file), content: source },
      { name: `${basename(file)}.snap`, content: snapshot },
    ];
  });

  return { rule, kept, removedSources: sources.length - 2 };
});

plans.forEach(({ rule, kept }) => {
  kept.forEach(({ name, content }) => {
    writeFileSync(join(rule, name), content);
  });
  readdirSync(rule)
    .filter((name) => !kept.some((file) => file.name === name))
    .forEach((name) => {
      rmSync(join(rule, name), { recursive: true });
    });
});

ruleDirectories
  .filter((rule) => walk(rule).length === 0)
  .forEach((rule) => {
    rmSync(rule, { recursive: true });
  });

process.stdout.write(
  `Kept ${plans.length * 2} fixtures across ${plans.length} rules; removed ${plans.reduce((count, plan) => count + plan.removedSources, 0)} extra fixtures and their snapshots.\n`,
);
