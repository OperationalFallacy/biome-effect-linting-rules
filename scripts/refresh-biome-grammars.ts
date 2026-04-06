import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const args = process.argv.slice(2);
const refFlagIndex = args.findIndex((arg) => arg === "--ref");
const biomeRef =
  refFlagIndex >= 0 && args[refFlagIndex + 1] ? args[refFlagIndex + 1] : "main";

const rootDir = dirname(dirname(new URL(import.meta.url).pathname));
const rulesDir = join(rootDir, "rules");

const grammarFiles = [
  {
    fileName: "js.ungram",
    url: `https://raw.githubusercontent.com/biomejs/biome/${biomeRef}/xtask/codegen/js.ungram`,
  },
  {
    fileName: "gritql.ungram",
    url: `https://raw.githubusercontent.com/biomejs/biome/${biomeRef}/xtask/codegen/gritql.ungram`,
  },
] as const;

const refreshGrammar = async (fileName: string, url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const body = await response.text();
  await writeFile(join(rulesDir, fileName), body, "utf8");
};

const main = async () => {
  await mkdir(rulesDir, { recursive: true });

  for (const grammarFile of grammarFiles) {
    await refreshGrammar(grammarFile.fileName, grammarFile.url);
  }

  console.log(
    `Refreshed js.ungram and gritql.ungram from biomejs/biome@${biomeRef} into rules/.`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
