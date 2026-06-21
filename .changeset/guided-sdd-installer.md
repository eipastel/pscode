---
"@thiagodiogo/pscode": major
---

Reframe PSCode as a lightweight guided-SDD installer.

PSCode is no longer a spec-driven-development framework with a workflow engine,
artifact DAG, schemas and deep validation. It is now a small installer that lays
down the rails — slash commands, skills, instructions and a minimal `pscode/`
structure — so a coding agent runs a short, human-validated flow.

- New CLI: `init`, `update`, `doctor`, `clean`, `status`.
- Installs 8 slash commands (`/ps:do`, `/ps:grill`, `/ps:spec`, `/ps:design`,
  `/ps:tasks`, `/ps:apply-one`, `/ps:review`, `/ps:done`) and 4 skills
  (`pscode-guided-sdd`, `pscode-grill-me`, `pscode-mini-spec`,
  `pscode-task-runner`) for Claude Code, Codex, Cursor and Gemini.
- Adds `pscode/config.yaml` (short-document limits + one-task-at-a-time and
  approval guardrails), an optional `pscode/board.yaml`, and short change
  templates.
- Removes the workflow engine, schemas, artifact graph, validation, OpenSpec
  migration, workspaces, context store/initiatives, telemetry, completions and
  related commands.

BREAKING CHANGE: the previous commands, schemas and APIs have been removed.
