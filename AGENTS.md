# AGENTS.md

## Test label standard

Use explicit behavioral labels for Vitest cases.

1. Use `It catches ...` for invalid input that must produce diagnostics.
2. Use `It allows ...` for valid input that must pass without diagnostics.
3. Keep labels implementation-neutral and behavior-focused; avoid wording like `fails on` or `passes`.
