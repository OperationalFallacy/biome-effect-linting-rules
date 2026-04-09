import fs from "node:fs";
import { javascript, JsonPatch, ReleasableCommits } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { YarnNodeLinker } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const yarnVersion = "4.6.0";
const upgradeSchedule = "0 0 * * 1,4";
const prereleaseBranch = "feat/cli-demo-runner";

const project = new javascript.NodeProject({
  authorName: "Roman Naumenko",
  authorEmail: "hi@catenary.cloud",
  defaultReleaseBranch: "master",
  description:
    "Biome Grit rules for declarative Effect TypeScript composition and repository-wide style consistency.",
  deps: ["@biomejs/biome@^2.2.4"],
  devDeps: ["projen@^0.98.34", "tsx@^4.20.6", "typescript@^5.9.3"],
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
  releaseBranches: {
    [prereleaseBranch]: {
      majorVersion: 0,
      npmDistTag: "dev",
      prerelease: "dev",
      tagPrefix: "dev-v",
    },
  },
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
  "./full": "./configs/full.jsonc",
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

project.defaultTask?.reset("tsx .projenrc.ts");

if (project.github) {
  const buildWorkflow = project.github.workflows.find(
    (workflow) => workflow.name === "build",
  );
  const releaseWorkflows = project.github.workflows.filter(
    (workflow) => workflow.name === "release" || workflow.name.startsWith("release-"),
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

  for (const releaseWorkflow of releaseWorkflows) {
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
