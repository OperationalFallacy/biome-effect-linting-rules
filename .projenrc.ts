import fs from "node:fs";
import { javascript, JsonPatch, ReleasableCommits } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { YarnNodeLinker } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const yarnVersion = "4.6.0";
const upgradeSchedule = "0 0 * * 1,4";
const packageManifestPath = "package.json";
const currentPackageVersion = fs.existsSync(packageManifestPath)
  ? JSON.parse(fs.readFileSync(packageManifestPath, "utf8")).version ?? "0.0.0"
  : "0.0.0";

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
  releaseTrigger: ReleaseTrigger.workflowDispatch(),
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

project.package.addVersion(currentPackageVersion);

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
      JsonPatch.add("/on/workflow_dispatch/inputs", {
        repository: {
          description: "Repository to check out, for example owner/repo",
          required: false,
          type: "string",
        },
        ref: {
          description: "Branch, tag, or SHA to check out",
          required: false,
          type: "string",
        },
      }),
      JsonPatch.replace("/jobs/build/permissions/contents", "read"),
      JsonPatch.replace(
        "/jobs/build/steps/0/with/ref",
        "${{ github.event_name == 'workflow_dispatch' && (inputs.ref || github.ref_name) || github.event.pull_request.head.ref }}",
      ),
      JsonPatch.replace(
        "/jobs/build/steps/0/with/repository",
        "${{ github.event_name == 'workflow_dispatch' && (inputs.repository || github.repository) || github.event.pull_request.head.repo.full_name }}",
      ),
      JsonPatch.add("/jobs/build/steps/2/with/package-manager-cache", false),
      JsonPatch.replace(
        "/jobs/self-mutation/if",
        "always() && github.event_name == 'pull_request' && needs.build.outputs.self_mutation_happened && github.event.pull_request.head.repo.full_name == github.repository",
      ),
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
const upgradeWorkflowFile = fs.existsSync(upgradeWorkflowPath)
  ? fs.readFileSync(upgradeWorkflowPath, "utf8")
  : undefined;

const rewrittenUpgradeWorkflow = upgradeWorkflowFile
  ?.replace(`    - cron: 0 0 * * *`, `    - cron: ${upgradeSchedule}`)
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

if (rewrittenUpgradeWorkflow && rewrittenUpgradeWorkflow !== upgradeWorkflowFile) {
  fs.chmodSync(upgradeWorkflowPath, 0o644);
  fs.writeFileSync(upgradeWorkflowPath, rewrittenUpgradeWorkflow);
  fs.chmodSync(upgradeWorkflowPath, 0o444);
}

const releaseWorkflowPath = ".github/workflows/release.yml";
const releasePleaseWorkflow = `# ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".

name: release
on:
  push:
    branches:
      - master
      - dev
  workflow_dispatch: {}
env:
  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: "true"
jobs:
  release_please:
    if: github.ref_name == 'master'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    outputs:
      release_created: \${{ steps.release.outputs.release_created }}
    steps:
      - id: release
        uses: googleapis/release-please-action@v4
        with:
          config-file: release-please-config.json
          manifest-file: .release-please-manifest.json
  release_please_dev:
    if: github.ref_name == 'dev'
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    outputs:
      release_created: \${{ steps.release.outputs.release_created }}
    steps:
      - id: release
        uses: googleapis/release-please-action@v4
        with:
          config-file: release-please-config.dev.json
          manifest-file: .release-please-manifest.json
          target-branch: dev
  publish_npm:
    needs: release_please
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    env:
      CI: "true"
    if: \${{ needs.release_please.outputs.release_created == 'true' }}
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
      - name: Test
        run: yarn test
      - name: Publish
        env:
          NPM_CONFIG_PROVENANCE: "true"
        run: npm publish --access public
  publish_npm_dev:
    needs: release_please_dev
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    env:
      CI: "true"
    if: \${{ needs.release_please_dev.outputs.release_created == 'true' }}
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
      - name: Test
        run: yarn test
      - name: Publish dev
        env:
          NPM_CONFIG_PROVENANCE: "true"
        run: npm publish --tag dev --access public
`;

fs.chmodSync(releaseWorkflowPath, 0o644);
fs.writeFileSync(releaseWorkflowPath, releasePleaseWorkflow);
fs.chmodSync(releaseWorkflowPath, 0o444);

const devReleasePleaseConfigPath = "release-please-config.dev.json";
const devReleasePleaseConfig = {
  $schema: "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  packages: {
    ".": {
      "bump-patch-for-minor-pre-major": true,
      "changelog-path": "CHANGELOG.md",
      "include-component-in-tag": false,
      "package-name": "@catenarycloud/linteffect",
      prerelease: true,
      "prerelease-type": "dev.0",
      "release-type": "node",
      versioning: "prerelease",
    },
  },
};

fs.writeFileSync(
  devReleasePleaseConfigPath,
  `${JSON.stringify(devReleasePleaseConfig, null, 2)}\n`,
);
