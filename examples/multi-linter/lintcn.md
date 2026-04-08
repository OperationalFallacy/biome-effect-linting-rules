# lintcn setup

Vendor the currently ported `lintEffect` rules into the consumer repository:

```bash
npx lintcn add https://github.com/OperationalFallacy/biome-effect-linting-rules/tree/master/.lintcn/linteffect
```

That creates a local `.lintcn/linteffect/` package inside the consuming repository. The vendored pack currently matches the Oxlint rule-name surface and covers all 48 translated `lintEffect` rules.

You can then add more repository-local lintcn rules alongside it if you need stricter or more type-aware checks than the current translated pack covers.
