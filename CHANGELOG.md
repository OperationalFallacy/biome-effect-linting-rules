# Changelog

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
