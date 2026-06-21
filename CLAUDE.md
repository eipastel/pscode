# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Operating Principles

How to work in this repo (read this before the *what* below). The canonical,
tool-agnostic operating principles — distilled from the 20 Claude Code Engineering
Rules — live in `AGENTS.md` to avoid duplication, and are imported here:

@AGENTS.md

## Commands

```bash
# Build
pnpm build           # Compiles TypeScript via node build.js → dist/
pnpm dev             # Watch mode (tsc --watch)
pnpm dev:cli         # Build then run the CLI directly

# Test
pnpm test            # Run all tests (vitest run)
pnpm test:watch      # Watch mode
pnpm test:ui         # Vitest UI

# Run a single test file
pnpm exec vitest run test/cli/lifecycle.test.ts

# Lint
pnpm lint            # eslint src/

# Release
pnpm changeset       # Create a changeset entry
pnpm release         # Publishes via changeset (CI only)
```

Tests live in `test/` (not `src/`). The vitest config (`vitest.config.ts`) uses `pool: 'forks'` for per-file process isolation because tests manipulate `process.cwd()` and temp filesystems. CLI tests (`test/cli/`) spawn the built `dist/cli/index.js`, so **run `pnpm build` before them** if `dist/` may be stale; unit tests (`test/unit/`) import from `src/` directly.

## Architecture

`pscode` is a **lightweight installer**, not a workflow engine. Its single job is to
lay down the rails — slash commands, skills, instructions, and a minimal `pscode/`
file structure — so a coding agent can run a short, human-validated, spec-driven
flow. The agent drives the flow; PSCode never interprets schemas, builds DAGs, or
validates artifacts.

The guided flow (run inside the agent):
`/ps:do → /ps:grill → /ps:spec → /ps:design → /ps:tasks → /ps:apply-one → /ps:review → /ps:done`

### Entry Points

- `bin/pscode.js` → `dist/cli/index.js` → `src/cli/index.ts` — the CLI entrypoint. Builds a Commander `program` (`buildProgram`) and runs it. `index.ts` auto-runs `runCli()` when it is the main module; `bin` imports and calls `runCli()`.
- `src/index.ts` re-exports the public API (`cli/` + `core/`) for library consumers.

### Core Concepts

**Content** (`src/core/content/`)  
The tool-agnostic substance PSCode installs, as string constants (bundled into `dist`, no file-copy at runtime):
- `commands.ts` — the 8 slash commands (`do`, `grill`, `spec`, `design`, `tasks`, `apply-one`, `review`, `done`).
- `skills.ts` — the 4 skills (`pscode-guided-sdd`, `pscode-grill-me`, `pscode-mini-spec`, `pscode-task-runner`).
- `change-templates.ts` — the 5 short change templates (`brief`, `questions`, `design`, `tasks`, `review`).
- `index.ts` also exports `AGENTS_BLOCK_BODY`, the text injected into AGENTS.md/CLAUDE.md.

**Adapters** (`src/core/adapters.ts`)  
One adapter per agent (claude, codex, cursor, gemini). All share a uniform layout — commands at `<dir>/commands/ps/<id>.md` (so they invoke as `/ps:<id>`), skills at `<dir>/skills/<name>/SKILL.md` — differing only by root dir. Adds a `generatedBy` version stamp to each file (used by `doctor`/`update`).

**Installer** (`src/core/installer.ts`)  
Writes/removes the rails: `installAgent`, `removeAgent`, `installChangeTemplates`, `ensureProjectStructure`, plus status helpers (`installedVersion`, `agentArtifactStatus`, `isAgentInstalled`).

**Config & Board** (`src/core/pscode-config.ts`, `src/core/board.ts`)  
`pscode/config.yaml` (Zod-validated): agents, profile, board toggle, the short-document `limits`, and the two guardrails (`apply_mode: one_task_at_a_time`, `approval_required`). `pscode/board.yaml` is an optional, tiny local board — just `states` + `cards`, no Kanban engine.

**Detection & Instruction Files** (`src/core/detect.ts`, `src/core/agents-md.ts`)  
`detectAgents` finds agents in use. `agents-md.ts` manages the PSCode block between `<!-- PSCODE:START -->` / `<!-- PSCODE:END -->` markers — only that block is rewritten; user content is preserved.

**Changes** (`src/core/changes.ts`)  
Reads `pscode/changes/<slug>/` and derives a simple state per change (`draft` → `spec-review` → `ready` → `doing` → `review` → `done`) from which artifacts exist and task progress. No engine — just file presence.

### Directory Layout

```
src/
  cli/index.ts          — Commander program (init, update, doctor, clean, status)
  commands/             — One handler per command: init, update, doctor, clean, status
  core/
    config.ts           — version, AGENTS list, limits, board states
    content/            — commands, skills, change templates, AGENTS block (string constants)
    adapters.ts         — per-agent file paths + frontmatter rendering
    installer.ts        — write/remove rails; install status helpers
    pscode-config.ts    — pscode/config.yaml (Zod) read/write
    board.ts            — pscode/board.yaml (Zod) read/write
    detect.ts           — detect agents in use
    agents-md.ts        — managed AGENTS.md/CLAUDE.md block
    changes.ts          — list changes + derive state
    fs-utils.ts         — small fs helpers
    interactive.ts      — whether prompting is allowed
test/
  unit/                 — import from src/ directly
  cli/                  — spawn the built CLI (dist/)
  helpers/              — run-cli.ts (spawns dist), tmp.ts (temp projects)
```

**CLI Commands** (`src/commands/`)  
- `pscode init` — install the workflow (detects/prompts agents; `--agent`, `--no-board`, `--yes`, `--profile`).
- `pscode update` — refresh PSCode-controlled files in place, preserving user content.
- `pscode doctor` — verify config, structure, board, and per-agent install/version; non-zero exit on issues.
- `pscode clean` — remove the rails (`--all` also removes `pscode/`); destructive actions need `--yes`.
- `pscode status` — list changes and their derived state.

### Key Conventions

- All source is ESM (`"type": "module"`); imports use `.js` extension even for `.ts` source files.
- Import `@inquirer/*` **dynamically** (`await import(...)`), never statically — static imports can hang piped-stdin hooks (enforced by eslint `no-restricted-imports`).
- Zod v4 validates `config.yaml` / `board.yaml`.
- Installed files carry a `generatedBy: <version>` stamp; `doctor` flags stale installs and `update` rewrites them.
- Changesets (`@changesets/cli`) manage versioning; add a changeset entry before releasing.
