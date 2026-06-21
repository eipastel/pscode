# AGENTS.md

Canonical, tool-agnostic guidance for any AI agent (Claude, Codex, Cursor, Gemini, …)
working in this repository. `CLAUDE.md` holds the deep architecture reference and
imports the principles below — keep operating guidance here, not duplicated there.

## Overview

`pscode` is a **lightweight installer** for a guided, spec-driven workflow. It
installs slash commands, skills, instructions and a minimal file structure so a
coding agent can run a short, human-validated flow that mirrors the GitHub
Project board (draft → refine → dev → complete, one subtask at a time). It is *not* a
workflow engine — the agent drives the flow; PSCode installs the rails. Source
is ESM TypeScript under `src/` (see `CLAUDE.md` for the full map).

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
   extensions; import `@inquirer/*` dynamically (never statically); edit existing
   files rather than spawning new ones.
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
