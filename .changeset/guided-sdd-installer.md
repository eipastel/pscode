---
"@thiagodiogo/pscode": major
---

Reframe PSCode as a lightweight guided-SDD installer.

PSCode is no longer a spec-driven-development framework with a workflow engine,
artifact DAG, schemas and deep validation. It is now a small installer that lays
down the rails — slash commands, skills, instructions and a minimal `pscode/`
structure — so a coding agent runs a short, human-validated flow.

- New CLI: `init`, `update`, `doctor`, `clean`, `status`.
- Installs 8 slash commands (`/ps:draft`, `/ps:grill`, `/ps:spec`, `/ps:design`,
  `/ps:tasks`, `/ps:apply-one`, `/ps:review`, `/ps:done`) and 4 skills
  (`pscode-guided-sdd`, `pscode-grill-me`, `pscode-mini-spec`,
  `pscode-task-runner`) for Claude Code, Codex, Cursor and Gemini.
- Adds `pscode/config.yaml` (short-document limits + one-task-at-a-time and
  approval guardrails) and short change templates.
- Writes the managed instruction block into the file each selected agent reads:
  Claude Code → `CLAUDE.md`, the others → `AGENTS.md` (both when mixed).
- `init` is an interactive wizard by default (language → agents), with `--yes`
  and explicit flags as the non-interactive bypass.
- `pscode init` can enable Claude Code's `bypassPermissions` mode: when Claude
  Code is selected, the wizard asks whether to write
  `permissions.defaultMode: bypassPermissions` into `.claude/settings.json`
  (merging into existing settings). Defaults to yes; control it with
  `--bypass-permissions` / `--no-bypass-permissions`. Never written when Claude
  Code is not selected. Its yes/no prompt resolves on the first keypress.
- `update` now wipes the `commands/ps/` folder and every `skills/pscode-*` folder
  before rewriting, so commands or skills removed/renamed in a new version don't
  linger.
- Removes the workflow engine, schemas, artifact graph, validation, OpenSpec
  migration, workspaces, context store/initiatives, telemetry, completions, the
  local board and related commands.

BREAKING CHANGE: the previous commands, schemas and APIs have been removed.
