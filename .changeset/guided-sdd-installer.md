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
  and explicit flags as the non-interactive bypass. The agent picker offers only
  Claude Code (marked recommended) and Codex; Cursor and Gemini stay reachable
  via `--agent` and detection.
- `pscode init` can enable Claude Code's `bypassPermissions` mode: when Claude
  Code is selected, the wizard asks whether to write
  `permissions.defaultMode: bypassPermissions` into `.claude/settings.json`
  (merging into existing settings). Defaults to yes; control it with
  `--bypass-permissions` / `--no-bypass-permissions`. Never written when Claude
  Code is not selected. Its yes/no prompt resolves on the first keypress.
- When `init` finishes it can open the selected agent's CLI (`claude`, `codex`
  or `gemini`) — Claude Code preferred when more than one is selected — handing
  off the terminal. Defaults to yes and is honored in `--yes` runs; control it
  with `--open` / `--no-open`. The agent is only launched when a real terminal
  is present; in CI or piped runs PSCode prints how to start it instead of
  blocking. Cursor has no unambiguous CLI, so it is never auto-opened.
- `update` now wipes the `commands/ps/` folder and every `skills/pscode-*` folder
  before rewriting, so commands or skills removed/renamed in a new version don't
  linger.
- Removes the workflow engine, schemas, artifact graph, validation, OpenSpec
  migration, workspaces, context store/initiatives, telemetry, completions, the
  local board and related commands.

BREAKING CHANGE: the previous commands, schemas and APIs have been removed.
