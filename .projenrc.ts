import fs from "node:fs";
import { javascript, JsonPatch, ReleasableCommits } from "projen";
import { JobStep } from "projen/lib/github/workflows-model";
import { YarnNodeLinker } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const yarnVersion = "4.6.0";

const project = new javascript.NodeProject({
  authorName: "Roman Naumenko",
  authorEmail: "hi@catenary.cloud",
  defaultReleaseBranch: "master",
  description:
    "Biome Grit rules for declarative Effect TypeScript composition and repository-wide style consistency.",
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
  name: "lintEffect",
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmPublishOptions: {
    trustedPublishing: true,
  },
  packageManager: javascript.NodePackageManager.YARN_BERRY,
  packageName: "@catenarycloud/linteffect",
  prettier: false,
  projenrcTs: true,
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

project.package.addField("files", [
  "biome.jsonc",
  "rules/*.grit",
  "examples",
  "docs",
  "README.md",
  "LICENSE",
]);

project.package.addField("publishConfig", {
  access: "public",
});

project.package.addField("repository", {
  type: "git",
  url: "https://github.com/OperationalFallacy/biome-effect-linting-rules.git",
});

project.package.addField("exports", {
  ".": "./biome.jsonc",
  "./recommended": "./biome.jsonc",
  "./package.json": "./package.json",
});

project.gitignore.exclude("/dist/");

project.addTask("pack:dry-run", {
  exec: "npm pack --dry-run",
});

project.addTask("refresh:biome-grammars", {
  exec: "tsx scripts/refresh-biome-grammars.ts",
});

project.defaultTask?.reset("tsx .projenrc.ts");

const releaseWorkflow = project.github?.tryFindWorkflow("release");

if (releaseWorkflow) {
  releaseWorkflow.file?.patch(
    JsonPatch.add("/jobs/release/steps/2/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release/steps/2", {
      name: "Install Specific Yarn Version",
      run: `corepack enable && corepack prepare yarn@${yarnVersion} --activate`,
    }),
    JsonPatch.add("/jobs/release/steps/3/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release_github/steps/0/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release_npm/steps/0/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release_npm/steps/2", {
      name: "Install Specific Yarn Version",
      run: `corepack enable && corepack prepare yarn@${yarnVersion} --activate`,
    }),
    JsonPatch.add("/jobs/release_npm/steps/4/env/NPM_TRUSTED_PUBLISHER", "true"),
  );
}

if (project.github) {
  const buildWorkflow = project.github.workflows.find(
    (workflow) => workflow.name === "build",
  );
  const upgradeWorkflow = project.github.workflows.find(
    (workflow) => workflow.name === `upgrade-${project.defaultReleaseBranch}`,
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

  if (upgradeWorkflow) {
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

const rewrittenUpgradeWorkflow = upgradeWorkflowFile.replace(
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
