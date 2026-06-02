# AGENTS.md

Canonical, tool-agnostic guidance for any AI agent (Claude, Codex, Cursor, Gemini, …)
working in this repository. `CLAUDE.md` holds the deep architecture reference and
imports the principles below — keep operating guidance here, not duplicated there.

## Overview

`pscode` is a CLI for **spec-driven, AI-native development**. Every feature change
flows through a pipeline of planning artifacts (proposal → specs → design → tasks →
apply), tracked under `pscode/changes/<name>/`. Source is ESM TypeScript; the public
API and all commands live under `src/` (see `CLAUDE.md` for the full map).

## Essential Commands

```bash
pnpm build                 # Compile TypeScript → dist/
pnpm dev                   # tsc --watch
pnpm test                  # Run all tests (vitest run)
pnpm test -- test/x.test.ts  # Single test file
pnpm lint                  # eslint src/
pnpm changeset             # Add a changeset before releasing
```

## Operating Principles

Distilled from the 20 Claude Code Engineering Rules. Apply them in order of doubt.

1. **Understand before acting.** Read the relevant files and grasp the problem and
   surrounding code before editing — never guess at structure you can inspect.
2. **Stay surgical.** Make the smallest change that solves the task. No
   over-engineering, no scope creep, no refactoring unrelated code.
3. **Follow the project's conventions and tooling.** Match the style of neighboring
   code; use pnpm, vitest, eslint and changesets; keep ESM imports with `.js`
   extensions; prefer verb-first commands (`pscode change *` is deprecated); edit
   existing files rather than spawning new ones.
4. **Respect the context budget.** Be concise — distill, don't dump. High value per line.
5. **Don't declare done without verifying.** Run `pnpm build`, `pnpm test` and
   `pnpm lint` (build before focused CLI tests if `dist/` may be stale) and confirm
   behavior before claiming completion.
6. **Be honest about uncertainty and conflicts.** Never fabricate; surface unknowns,
   errors and trade-offs instead of hiding them; handle errors deliberately.
7. **Deliver clean and traceable.** No unrequested features, no dead or commented-out
   code; finish with a clear, actionable summary and the rationale behind decisions.

## Tests

Test-specific guidance (running focused tests, path canonicalization) lives in
[`test/AGENTS.md`](test/AGENTS.md).
