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
    JsonPatch.add("/jobs/release/steps/3", {
      name: "Install Specific Yarn Version",
      run: `corepack enable && yarn set version ${yarnVersion}`,
    }),
    JsonPatch.add("/jobs/release_github/steps/0/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release_npm/steps/0/with/package-manager-cache", false),
    JsonPatch.add("/jobs/release_npm/steps/2", {
      name: "Install Specific Yarn Version",
      run: `corepack enable && yarn set version ${yarnVersion}`,
    }),
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
    run: `corepack enable && yarn set version ${yarnVersion}`,
  };

  if (buildWorkflow) {
    buildWorkflow.file?.patch(
      JsonPatch.add("/jobs/build/steps/2/with/package-manager-cache", false),
    );
    const buildJob = buildWorkflow.getJob("build");
    if (buildJob && "steps" in buildJob) {
      const buildSteps = buildJob.steps as unknown as () => JobStep[];
      buildWorkflow.updateJob("build", {
        ...buildJob,
        steps: [corepackStep, ...buildSteps()],
      });
    }
  }

  if (upgradeWorkflow) {
    const upgradeJob = upgradeWorkflow.getJob("upgrade");
    if (upgradeJob && "steps" in upgradeJob) {
      const upgradeSteps = upgradeJob.steps as unknown as JobStep[];
      upgradeWorkflow.updateJob("upgrade", {
        ...upgradeJob,
        steps: [corepackStep, ...upgradeSteps],
      });
    }
  }
}

const generatedUpgradeWorkflow = project.github?.workflows.find(
  (workflow) => workflow.name === `upgrade-${project.defaultReleaseBranch}`,
);

generatedUpgradeWorkflow?.file?.patch(
  JsonPatch.add("/jobs/upgrade/steps/1/with/package-manager-cache", false),
);

project.synth();
