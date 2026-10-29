import fs from "node:fs";

import { Effect, Schema } from "effect";
import { JsonFile, JsonPatch, javascript, ReleasableCommits } from "projen";
import type { JobStep } from "projen/lib/github/workflows-model";
import { YarnNodeLinker } from "projen/lib/javascript";
import { ReleaseTrigger } from "projen/lib/release";

const synthesize = Effect.fn("synthesize")(function* () {
  const yarnVersion = "4.6.0";
  const upgradeSchedule = "0 0 * * 1,4";
  const packageManifestPath = "package.json";
  const currentPackageVersion = fs.existsSync(packageManifestPath)
    ? (yield* Schema.decodeUnknownEffect(
        Schema.fromJsonString(Schema.Struct({ version: Schema.String })),
      )(fs.readFileSync(packageManifestPath, "utf8"))).version
    : "0.0.0";

  const project = new javascript.NodeProject({
    authorName: "Roman Naumenko",
    authorEmail: "hi@catenary.cloud",
    defaultReleaseBranch: "master",
    description:
      "Biome Grit rules for declarative Effect TypeScript composition and repository-wide style consistency.",
    deps: [
      "@biomejs/wasm-nodejs@2.6.3",
      "@effect/platform-node-shared@4.0.6",
      "effect@4.0.6",
    ],
    devDeps: [
      "@biomejs/biome@2.6.3",
      "@catenarycloud/linteffect@dev",
      "@types/node@^24",
      "projen@^0.98.34",
      "tsx@^4.20.6",
      "typescript@^5.9.3",
      "vite@^8",
      "vitest@^5.0.5",
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
    minNodeVersion: "24.0.0",
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
    repository:
      "https://github.com/OperationalFallacy/biome-effect-linting-rules.git",
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
    "biome.base.jsonc",
    "bin",
    "lib",
    "rules/*.grit",
    "configs",
    "examples",
    "docs",
    "!docs/*-ticket.md",
    "README.md",
    "LICENSE",
  ]);

  project.package.addField("bin", "./bin/linteffect.mjs");
  project.package.addField("type", "module");

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
  project.gitignore.exclude("/docs/*-ticket.md");
  project.gitignore.exclude("/refs/");
  project.gitignore.exclude("/.local/");
  project.gitignore.exclude("/lib/");
  project.gitattributes.addAttributes(
    "/tests/runtime/native-parity/unicode-crlf.ts",
    "-text",
    "whitespace=cr-at-eol",
  );

  project.addTask("pack:dry-run", {
    steps: [{ spawn: "compile" }, { exec: "npm pack --dry-run" }],
  });

  project.addTask("refresh:biome-grammars", {
    exec: "tsx scripts/refresh-biome-grammars.ts",
  });

  project.addTask("typecheck", {
    exec: "tsc --project tsconfig.json",
  });
  project.addTask("lint", {
    exec: "biome check",
    receiveArgs: true,
  });
  project.addTask("lint:dev", {
    exec: "biome check --config-path=biome.jsonc",
    receiveArgs: true,
  });
  project.addTask("lint:local", {
    exec: "biome check --config-path=biome.local.jsonc",
    receiveArgs: true,
  });

  new JsonFile(project, "biome.base.jsonc", {
    marker: false,
    obj: {
      $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
      formatter: { enabled: true, indentStyle: "space", indentWidth: 2 },
      javascript: { formatter: { quoteStyle: "double" } },
      json: { formatter: { expand: "always" } },
      assist: {
        enabled: true,
        actions: {
          recommended: false,
          source: {
            organizeImports: {
              level: "on",
              options: {
                groups: [
                  [":BUN:", ":NODE:"],
                  ":BLANK_LINE:",
                  ":URL:",
                  [
                    ":PACKAGE:",
                    ":PACKAGE_WITH_PROTOCOL:",
                    "!effect/**",
                    "!@effect/**",
                  ],
                  ":BLANK_LINE:",
                  ["effect/**", "@effect/**"],
                  ":BLANK_LINE:",
                  ":URL:",
                  ":BLANK_LINE:",
                  ":PATH:",
                ],
              },
            },
          },
        },
      },
      files: {
        ignoreUnknown: false,
        includes: [
          ".projenrc.ts",
          "bin/**",
          "scripts/**",
          "src/**",
          "tests/**/*.test.ts",
          "tests/support/**",
          "vitest.config.mts",
          "!!refs",
          "!!.local",
          "!!dist",
          "!!lib",
        ],
      },
      linter: {
        enabled: true,
        rules: {
          preset: "recommended",
          style: { useConst: "error" },
          complexity: { useArrowFunction: "off" },
        },
      },
      vcs: { clientKind: "git", enabled: true, useIgnoreFile: true },
    },
  });

  new JsonFile(project, "biome.jsonc", {
    marker: false,
    obj: {
      $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
      root: true,
      extends: ["./biome.base.jsonc", "@catenarycloud/linteffect"],
    },
  });

  const preset = yield* Schema.decodeUnknownEffect(
    Schema.fromJsonString(
      Schema.Struct({ plugins: Schema.Array(Schema.String) }),
    ),
  )(fs.readFileSync("configs/full.jsonc", "utf8"));
  new JsonFile(project, "biome.local.jsonc", {
    marker: false,
    obj: {
      $schema: "./node_modules/@biomejs/biome/configuration_schema.json",
      root: true,
      extends: ["./biome.base.jsonc"],
      plugins: preset.plugins.map((plugin) =>
        plugin.replace("./node_modules/@catenarycloud/linteffect/", "./"),
      ),
    },
  });
  project.compileTask.exec("tsc --project tsconfig.build.json");
  project.testTask.reset();
  project.testTask.spawn(project.compileTask);
  project.testTask.exec("yarn lint");
  project.testTask.exec("vitest run");
  project.testTask.exec("yarn typecheck");

  project.defaultTask?.reset("tsx .projenrc.ts");

  if (project.github) {
    const buildWorkflow = project.github.workflows.find(
      (workflow) => workflow.name === "build",
    );
    const upgradeWorkflows = project.github.workflows.filter((workflow) =>
      workflow.name.startsWith("upgrade-"),
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
          `\${{ github.event_name == 'workflow_dispatch' && (inputs.ref || github.ref_name) || github.event.pull_request.head.ref }}`,
        ),
        JsonPatch.replace(
          "/jobs/build/steps/0/with/repository",
          `\${{ github.event_name == 'workflow_dispatch' && (inputs.repository || github.repository) || github.event.pull_request.head.repo.full_name }}`,
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

  if (
    rewrittenUpgradeWorkflow &&
    rewrittenUpgradeWorkflow !== upgradeWorkflowFile
  ) {
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
        uses: googleapis/release-please-action@v5
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
        uses: googleapis/release-please-action@v5
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
    if: github.ref_name == 'dev'
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
      - name: Publish dev if missing
        env:
          NPM_CONFIG_PROVENANCE: "true"
        run: |-
          PACKAGE_NAME=$(node -p "require('./package.json').name")
          PACKAGE_VERSION=$(node -p "require('./package.json').version")
          case "$PACKAGE_VERSION" in
            *-dev*) ;;
            *) echo "Skipping non-dev version $PACKAGE_VERSION"; exit 0 ;;
          esac
          if npm view "$PACKAGE_NAME@$PACKAGE_VERSION" version >/dev/null 2>&1; then
            echo "$PACKAGE_NAME@$PACKAGE_VERSION is already published"
            exit 0
          fi
          npm publish --tag dev --access public
`;

  fs.chmodSync(releaseWorkflowPath, 0o644);
  fs.writeFileSync(releaseWorkflowPath, releasePleaseWorkflow);
  fs.chmodSync(releaseWorkflowPath, 0o444);

  const devReleasePleaseConfigPath = "release-please-config.dev.json";
  const devReleasePleaseConfig = {
    $schema:
      "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
    packages: {
      ".": {
        "bump-patch-for-minor-pre-major": true,
        "changelog-path": "CHANGELOG.md",
        "include-component-in-tag": false,
        "package-name": "@catenarycloud/linteffect",
        prerelease: true,
        "prerelease-type": "dev",
        "release-type": "node",
        versioning: "prerelease",
      },
    },
  };

  const configuration = yield* Schema.encodeEffect(
    Schema.fromJsonString(Schema.Unknown, { space: 2 }),
  )(devReleasePleaseConfig);
  fs.writeFileSync(devReleasePleaseConfigPath, `${configuration}\n`);
});

Effect.runSync(synthesize());
