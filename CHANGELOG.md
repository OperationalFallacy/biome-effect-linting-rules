# Changelog

## [0.1.0-dev.4](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.1.0-dev.3...v0.1.0-dev.4) (2026-10-29)

### Fixture documentation and validation

All 158 rule fixtures now include documentation. The examples define their dependencies and explain the composition choices. Fixture loading rejects source files without a documentation comment.

The test suite passes all 208 tests. Strict typechecking passes for the 157 ordinary fixtures. One migration fixture deliberately uses the obsolete Effect.async API.

The packaged rules and CLI are unchanged from 0.1.0-dev.3.

## [0.1.0-dev.3](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.1.0-dev.2...v0.1.0-dev.3) (2026-10-29)


### Bug Fixes

* align operation composition with Effect v4 APIs ([d8a6b54](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/d8a6b5466d2189956c629e4077d98bb262cecb5f))
* align operation composition with Effect v4 APIs ([afeee88](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/afeee88b1484f915271ab47f6b67d7c4c43b9e72))

## [0.1.0-dev.2](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.1.0-dev.1...v0.1.0-dev.2) (2026-10-29)


### Bug Fixes

* avoid repeated module scans in cast and stylesheet matchers ([8a8c9f4](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/8a8c9f472b2b2ea0c25f4dc835e9339757b8034d))
* calibrate Effect v4 composition matchers and regressions ([656e142](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/656e142b59e99fc3a1693bfd72b6400ad78420c3))
* calibrate Effect v4 composition matchers with regressions ([361a780](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/361a7802a11b0c60d133ce1de2d8b11a3a11e144))


### Performance Improvements

* avoid repeated module scans for unrelated declarations ([62fc99a](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/62fc99a0f68e7983f3980e76c62c86342d84f30c))

## [0.1.0-dev.1](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.1.0-dev.0...v0.1.0-dev.1) (2026-10-29)


### Features

* replace custom CLI with native Effect commands and scoped Biome ([aa5c958](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/aa5c95848b9a283ec8a19fd1eccacba4510e97d2))
* ship native Effect CLI and fixture-based rule testing ([f99d9ff](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/f99d9ff2f49fbf95fa6f99b372c7ea99733df023))
* ship native Effect CLI and fixture-based rule testing ([f99d9ff](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/f99d9ff2f49fbf95fa6f99b372c7ea99733df023))


### Bug Fixes

* clarify service layers and preserve callback semantics ([022a877](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/022a87748203c96cb92481eaa23af15c0c9b0ff4))
* compile Effect CLI modules for installed Node packages ([762b1af](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/762b1afcc20635961d93f96372a570b67b40fc20))
* complete Effect-native tooling and pass release checks ([3283361](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/3283361d55d99dd5f3ff02bff7c3beb67a98d704))
* distinguish status constants from ordinary text ([a41c0aa](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a41c0aac14ddc3c53c1368ddbec697920ff183fe))
* match only direct object spreads in fragment assembly rule ([a1ced38](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a1ced38d215783ca93868ef2cfe8fe14bb035fe4))
* preserve repeated matches and import scope in Effect rules ([628f963](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/628f963ab1625d94fe45212894b47ea45af4594e))
* restrict expression callback advice to single return bodies ([4410d13](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/4410d13f6d52941d557988591e6c2fba48f023df))

## [0.1.0-dev.0](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.0.9...v0.1.0-dev.0) (2026-10-28)


### ⚠ BREAKING CHANGES

* migrate dev rules to Effect v4
* finish Effect v4 rules and sanitize public examples

### Features

* finish Effect v4 rules and sanitize public examples ([fede562](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/fede5626b2bf3b2ec914ff7bf5e37e93de3fbb3a))
* migrate dev rules to Effect v4 ([28c95f0](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/28c95f0145e379f0cdc8cd83d3f90a4b27438bf4))


### Miscellaneous Chores

* **dev:** prepare Effect v4 prerelease ([3b5e9aa](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/3b5e9aaa42c3ec78dbd05ee87a4f87fe07a10c2c))

## [0.0.9](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.0.8...v0.0.9) (2026-10-21)


### Features

* improve rule diagnostics and add collection and style checks ([e5d7017](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/e5d7017bc2ccbd3f1908cf4a2898981de5f6b592))
* warn on Effect value keys and improve lint guidance ([c705b6e](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/c705b6e0a813f16c6ee0d88e1a8c4806ec235d7f))


### Bug Fixes

* allow complete service operations in staging rule ([ea092d6](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/ea092d62781c8ae85b379d0a506761ee2585a973)), closes [#38](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/38)

## [0.0.8](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.0.7...v0.0.8) (2026-07-17)


### Features

* detect loose tag extraction from unknown ([d81736d](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/d81736d8899705a49dd16c5a972799a21711f2b8))
* detect manual data guards over unknown input ([c7b7baf](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/c7b7baf7dc9923d6d1d02da9323c302e84a90081))


### Bug Fixes

* align tag rule fixtures with Effect ADTs ([2396cda](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/2396cda722d50348478562c84774fbe251f5c51b))
* generalize manual data guard detection ([a5935c2](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a5935c2e17fa08e40b946de348f91d09a24697cf))
* make arrow return advisory prompt review ([d527248](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/d5272489aa8fe47ae72f3d9fb841847246379093))
* make arrow return advisory prompt review ([be63059](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/be63059b36c5710ed5c080653007200cd45a4c31))

## [0.0.7](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.0.6...v0.0.7) (2026-07-17)


### Features

* add defragmentation guardrail rules ([78173a5](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/78173a56b8eaeb50d9eaac81c5e35b7f59101740))
* calibrate defragmentation guardrails ([11786a7](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/11786a771b6bdaff2b34933557570b5a28d1cbad))
* calibrate defragmentation guardrails ([7a2dec7](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/7a2dec71619d9bb4b2ff699e36d7a592818c11ed))


### Bug Fixes

* allow context index rebuilds outside Ref transitions ([4dc3934](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/4dc39341130a202813062c602484b6f6d28fb00e))
* anchor grit rules for lint performance ([024a481](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/024a4812f985a969840a5e3419c42803abf24d9b))
* anchor Grit rules for lint performance ([287a33b](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/287a33b017359dd6f1a1b1b84bf66a456be20722))
* delete nested Effect argument rule ([ff8f1ac](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/ff8f1aca13dfe1f41b08af90fcca773578f6c7d9))
* increment dev prerelease suffixes ([7a2d048](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/7a2d048d043d209d8a31f90f2dcf38e9b12eaf24))
* remove nested Effect argument rule from presets ([db41a18](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/db41a18353e66467cb4992d537a2fd2b5bfe5b9b))
* remove noisy nested Effect argument rule from presets ([5f0fbc0](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/5f0fbc0b8406cd2101510d3176d90157edc3fd3a))

## [0.0.6](https://github.com/OperationalFallacy/biome-effect-linting-rules/compare/v0.0.5...v0.0.6) (2026-05-29)


### Features

* add family collection read lint rule ([5a2dfe7](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/5a2dfe7a587190260ea7f7e8441f34833b2a9ceb))
* add linteffect cli and prerelease branch publish ([9c74f37](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/9c74f37b22487d8e84e83bf12e6cbfe7b2f5b095))
* add no-family-collection-read lint rule ([2e8ee2e](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/2e8ee2eeaaee2260c74ab407bd086a28a3bf23ed))
* add no-naked-object-state-update rule and agent guide workflow ([8f5420a](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/8f5420a34c5c901aefdc7584bb9cbef1a4a3fc15))
* add no-naked-object-state-update rule and guide workflow ([08a172f](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/08a172f76ecf48a5cdd05358265d9af975355ba0))
* ship cli-based zero-setup lintEffect trial flow ([a80eacb](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a80eacbb1ccc5a1e1bb8dc7eed52dadc57eaa8ad))
* split published presets and ship lint guidance ([#5](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/5)) ([5760113](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/5760113488e500c0026bef28abe54e165ab3ef0a))


### Bug Fixes

* add release pull request automation ([#15](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/15)) ([bd9d1de](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/bd9d1deccd90408a0b4fa60ae4caa89efb6fd5ae))
* align cli surface with published behavior ([82d654f](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/82d654ffac69cb70a3279a5e1cc52531fbe16946))
* allow as const in no-model-overlay-cast ([a3db050](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a3db050fce920add5af444127fb43f80d20fd2ed))
* disable setup-node package-manager cache ([106bd0b](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/106bd0bb68c2c96913e94156ce8c0028795cf182))
* enable corepack before ci yarn detection ([8cf6cff](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/8cf6cff38d4bddd17e78352944bc0580d6f50d43))
* enable corepack before ci yarn detection ([e3db6de](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/e3db6decab5ad18035715324459cec5fdd7740e0))
* enable npm trusted publisher mode ([0854840](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/0854840a152d4442a6980806c365b39fb86bdc67))
* keep pre-1 releases on patch bumps ([#19](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/19)) ([1ba2e7f](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/1ba2e7f426462645aa30df86f1f7ae783e28bc96))
* let release-please open release pull requests ([#16](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/16)) ([a052c1b](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/a052c1ba79910d70e4fcef02ff2988c7f1661fcf))
* make no-switch-statement flag switch statements ([f408e42](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/f408e4248f89d9e41a61504b3c46e62a4859a995))
* require manual release dispatch ([#14](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/14)) ([cb8fb02](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/cb8fb02176c23ee5f6a6d1d1c7bb5c7dea6a1a32))
* support manual build workflow dispatch ([#13](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/13)) ([2588c0a](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/2588c0ac80edaca4a423192b5420e7dd1f53a6d4))
* use default token for release-please ([#17](https://github.com/OperationalFallacy/biome-effect-linting-rules/issues/17)) ([c77d0f5](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/c77d0f5f943927227d8bdca6686cc990bde44ae3))
* use release.yml for manual prereleases ([1ccf1a2](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/1ccf1a2a12b52cd49679d5288ce604ac433e38ed))
* use top-level projen prerelease branch workflows ([449b64e](https://github.com/OperationalFallacy/biome-effect-linting-rules/commit/449b64e661260ce20ed22509d4f4a30f430f079d))

## 0.0.5

Added `no-family-collection-read`, a lint rule that prevents keyed atom-family projections from reading collection/list projections. Row/item atoms should read from keyed source or index atoms to avoid circular projection graphs and unnecessary broad invalidation.
