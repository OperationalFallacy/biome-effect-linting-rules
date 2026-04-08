import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateEditorGoFiles } from "lintcn/src/codegen";
import {
  DEFAULT_TSGOLINT_VERSION,
  ensureTsgolintSource,
} from "lintcn/src/cache";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const lintcnDir = path.join(repoRoot, ".lintcn");
const rulesDir = path.join(lintcnDir, "linteffect");
const tsgolintLink = path.join(lintcnDir, ".tsgolint");

async function main() {
  if (!fs.existsSync(rulesDir)) {
    throw new Error(`Missing lintcn rule directory: ${rulesDir}`);
  }

  const tsgolintDir = await ensureTsgolintSource(DEFAULT_TSGOLINT_VERSION);
  generateEditorGoFiles(lintcnDir);

  try {
    fs.lstatSync(tsgolintLink);
    fs.rmSync(tsgolintLink, { force: true, recursive: true });
  } catch {
    // The link does not exist yet.
  }

  fs.symlinkSync(tsgolintDir, tsgolintLink, "dir");

  console.log(`Prepared lintcn test workspace in ${lintcnDir}`);
}

void main();
