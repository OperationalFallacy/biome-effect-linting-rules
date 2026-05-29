import fs from "node:fs";
import { javascript, JsonPatch, ReleasableCommits } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { YarnNodeLinker } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const yarnVersion = "4.6.0";
const upgradeSchedule = "0 0 * * 1,4";

const project = new javascript.NodeProject({
  authorName: "Roman Naumenko",
  authorEmail: "hi@catenary.cloud",
  defaultReleaseBranch: "master",
  description:
    "Biome Grit rules for declarative Effect TypeScript composition and repository-wide style consistency.",
  deps: ["@biomejs/biome@^2.4.15"],
  devDeps: [
    "projen@^0.98.34",
    "tsx@^4.20.6",
    "typescript@^5.9.3",
    "vitest@^4.1.1",
  ],
  entrypoint: "",
  github: true,
  jest: false,
  keywords: [
    "biome",
    "grit",
    "effect",
    "typescript",
    "lint",
    "agent",
    "code-style",
  ],
  license: "MIT",
  licensed: true,
  majorVersion: 0,
  name: "lintEffect",
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmDistTag: "latest",
  packageManager: javascript.NodePackageManager.YARN_BERRY,
  packageName: "@catenarycloud/linteffect",
  prettier: false,
  releaseToNpm: true,
  release: true,
  releaseTrigger: ReleaseTrigger.continuous(),
  releasableCommits: ReleasableCommits.featuresAndFixes(),
  repository: "https://github.com/OperationalFallacy/biome-effect-linting-rules.git",
  workflowNodeVersion: "24.11.1",
  yarnBerryOptions: {
    version: yarnVersion,
    zeroInstalls: false,
    yarnRcOptions: {
      nodeLinker: YarnNodeLinker.NODE_MODULES,
    },
  },
});

project.release?.publisher?.publishToNpm({
  trustedPublishing: true,
});

project.package.addField("files", [
  "biome.jsonc",
  "bin",
  "rules/*.grit",
  "configs",
  "examples",
  "docs",
  "README.md",
  "LICENSE",
]);

project.package.addField("bin", "./bin/linteffect.mjs");

project.package.addField("publishConfig", {
  access: "public",
});

project.package.addField("repository", {
  type: "git",
  url: "https://github.com/OperationalFallacy/biome-effect-linting-rules.git",
});

project.package.addField("exports", {
  ".": "./configs/full.jsonc",
  "./recommended": "./configs/full.jsonc",
  "./core": "./configs/core.jsonc",
  "./web": "./configs/web.jsonc",
  "./ts-type": "./configs/ts-type.jsonc",
  "./agent-guide": "./docs/linting.md",
  "./package.json": "./package.json",
});

project.gitignore.exclude("/dist/");
project.gitignore.exclude("/refs/");

project.addTask("pack:dry-run", {
  exec: "npm pack --dry-run",
});

project.addTask("refresh:biome-grammars", {
  exec: "tsx scripts/refresh-biome-grammars.ts",
});

project.testTask.reset("vitest run tests/rules");

project.defaultTask?.reset("tsx .projenrc.ts");

if (project.github) {
  const buildWorkflow = project.github.workflows.find(
    (workflow) => workflow.name === "build",
  );
  const releaseWorkflow = project.github.workflows.find(
    (workflow) => workflow.name === "release",
  );
  const upgradeWorkflows = project.github.workflows.filter(
    (workflow) => workflow.name.startsWith("upgrade-"),
  );

  const corepackStep = {
    name: "Install Specific Yarn Version",
    run: `corepack enable && corepack prepare yarn@${yarnVersion} --activate`,
  };

  const getJobSteps = (job: { steps?: unknown }): JobStep[] => {
    const rawSteps = job.steps;
    return typeof rawSteps === "function"
      ? (rawSteps as () => JobStep[])()
      : ((rawSteps as JobStep[]) ?? []);
  };

  if (buildWorkflow) {
    buildWorkflow.file?.patch(
      JsonPatch.add("/jobs/build/steps/2/with/package-manager-cache", false),
    );
    const buildJob = buildWorkflow.getJob("build");
    if (buildJob && "steps" in buildJob) {
      const buildSteps = getJobSteps(buildJob);
      buildWorkflow.updateJob("build", {
        ...buildJob,
        steps: [buildSteps[0], corepackStep, ...buildSteps.slice(1)],
      });
    }
  }

  if (releaseWorkflow) {
    releaseWorkflow.file?.patch(
      JsonPatch.add("/jobs/release/steps/2/with/package-manager-cache", false),
      JsonPatch.add("/jobs/release/steps/2", corepackStep),
      JsonPatch.add("/jobs/release/steps/3/with/package-manager-cache", false),
      JsonPatch.add("/jobs/release_github/steps/0/with/package-manager-cache", false),
      JsonPatch.add("/jobs/release_npm/steps/0/with/package-manager-cache", false),
      JsonPatch.add("/jobs/release_npm/steps/2", corepackStep),
      JsonPatch.add("/jobs/release_npm/steps/4/env/NPM_TRUSTED_PUBLISHER", "true"),
    );
  }

  for (const upgradeWorkflow of upgradeWorkflows) {
    const upgradeJob = upgradeWorkflow.getJob("upgrade");
    if (upgradeJob && "steps" in upgradeJob) {
      const upgradeSteps = getJobSteps(upgradeJob);
      upgradeWorkflow.updateJob("upgrade", {
        ...upgradeJob,
        steps: [upgradeSteps[0], corepackStep, ...upgradeSteps.slice(1)],
      });
    }
  }
}

project.synth();

const upgradeWorkflowPath = ".github/workflows/upgrade-master.yml";
const upgradeWorkflowFile = fs.readFileSync(upgradeWorkflowPath, "utf8");

const rewrittenUpgradeWorkflow = upgradeWorkflowFile
  .replace(
    `    - cron: 0 0 * * *`,
    `    - cron: ${upgradeSchedule}`,
  )
  .replace(
  `      - name: Checkout
        uses: actions/checkout@v5
        with:
          ref: master
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24.11.1`,
  `      - name: Checkout
        uses: actions/checkout@v5
        with:
          ref: master
      - name: Install Specific Yarn Version
        run: corepack enable && corepack prepare yarn@${yarnVersion} --activate
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24.11.1
          package-manager-cache: false`,
  );

if (rewrittenUpgradeWorkflow !== upgradeWorkflowFile) {
  fs.chmodSync(upgradeWorkflowPath, 0o644);
  fs.writeFileSync(upgradeWorkflowPath, rewrittenUpgradeWorkflow);
  fs.chmodSync(upgradeWorkflowPath, 0o444);
}

const releaseWorkflowPath = ".github/workflows/release.yml";
const releaseWorkflowFile = fs.readFileSync(releaseWorkflowPath, "utf8");

let rewrittenReleaseWorkflow = releaseWorkflowFile
  .replace(
    `  workflow_dispatch: {}`,
    `  workflow_dispatch:
    inputs:
      prerelease:
        description: prerelease identifier, for example dev or beta
        required: false
        default: ""
        type: string
      npm_dist_tag:
        description: npm dist-tag to publish under for manual runs
        required: false
        default: latest
        type: string`,
  )
  .replace(
    `      - name: release
        run: npx projen release`,
    `      - name: release
        env:
          PRERELEASE: \${{ github.event_name == 'workflow_dispatch' && inputs.prerelease || '' }}
        run: npx projen release`,
  )
  .replace(
    `    if: needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha`,
    `    if: needs.release.outputs.tag_exists != 'true' && needs.release.outputs.latest_commit == github.sha && (github.event_name != 'workflow_dispatch' || inputs.prerelease == '')`,
  )
  .replace(
    `          NPM_DIST_TAG: latest`,
    `          NPM_DIST_TAG: \${{ github.event_name == 'workflow_dispatch' && inputs.npm_dist_tag || 'latest' }}`,
  );

rewrittenReleaseWorkflow = rewrittenReleaseWorkflow
  .replace(
    `jobs:
  release:`,
    `jobs:
  dev_release:
    name: Publish npm dev build
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    if: github.event_name == 'workflow_dispatch' && inputs.prerelease == 'dev'
    env:
      CI: "true"
    steps:
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install Specific Yarn Version
        run: corepack enable && corepack prepare yarn@${yarnVersion} --activate
      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: 24.11.1
          package-manager-cache: false
      - name: Install dependencies
        run: yarn install --immutable
      - name: Set next dev version
        run: |-
          node <<'NODE'
          const { execFileSync } = require("node:child_process");
          const fs = require("node:fs");

          const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
          const distTags = JSON.parse(
            execFileSync("npm", ["view", packageJson.name, "dist-tags", "--json"], {
              encoding: "utf8",
            }),
          );
          const latest = distTags.latest ?? "0.0.0";
          const stableBase = latest.split("-")[0];
          const [major, minor, patch] = stableBase.split(".").map(Number);

          if (![major, minor, patch].every(Number.isInteger)) {
            throw new Error(\`Cannot derive next dev version from npm latest dist-tag: \${latest}\`);
          }

          const runNumber = process.env.GITHUB_RUN_NUMBER;
          const runAttempt = process.env.GITHUB_RUN_ATTEMPT ?? "1";
          const devVersion = \`\${major}.\${minor}.\${patch + 1}-dev.\${runNumber}.\${runAttempt}\`;

          packageJson.version = devVersion;
          fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2) + "\\n");
          fs.appendFileSync(process.env.GITHUB_ENV, \`DEV_VERSION=\${devVersion}\\n\`);
          NODE
      - name: Test
        run: yarn test
      - name: Prepare package output
        run: mkdir -p dist
      - name: Pack
        run: npm pack --pack-destination dist
      - name: Publish
        env:
          NPM_CONFIG_PROVENANCE: "true"
        run: npm publish ./dist/*.tgz --tag dev --access public
  release:`,
  )
  .replace(
    `  release:
    runs-on: ubuntu-latest`,
    `  release:
    if: github.event_name != 'workflow_dispatch' || inputs.prerelease != 'dev'
    runs-on: ubuntu-latest`,
  );

if (rewrittenReleaseWorkflow !== releaseWorkflowFile) {
  fs.chmodSync(releaseWorkflowPath, 0o644);
  fs.writeFileSync(releaseWorkflowPath, rewrittenReleaseWorkflow);
  fs.chmodSync(releaseWorkflowPath, 0o444);
}
