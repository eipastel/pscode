---
"@thiagodiogo/pscode": major
---

Reframe PSCode as a lightweight guided-SDD installer.

PSCode is no longer a spec-driven-development framework with a workflow engine,
artifact DAG, schemas and deep validation. It is now a small installer that lays
down the rails — slash commands, skills, instructions and a minimal `pscode/`
structure — so a coding agent runs a short, human-validated flow.

- New CLI: `init`, `update`, `doctor`, `clean`, `status`.
- Installs 6 slash commands (`/ps:draft`, `/ps:refine`, `/ps:dev`,
  `/ps:complete`, `/ps:cancel`, `/ps:board-setup`) and 9 skills
  (`pscode-guided-sdd`, `pscode-grill-me`, `pscode-refine`, `pscode-mini-spec`,
  `pscode-task-runner`, `pscode-dev`, `pscode-complete`, `pscode-github-sync`,
  `pscode-board-setup`) for Claude Code, Codex, Cursor and Gemini. The guided
  flow mirrors the GitHub Project board, moving the card at each step:
  `/ps:draft` (Backlog) → `/ps:refine <card#>` (In Refinement → Ready to Dev) →
  `/ps:dev <card#>` (In Development → In Code Review → In Test → Ready to Deploy)
  → `/ps:complete <card#>` (Done). `/ps:cancel <card#>` sends a card to Cancelled.
  Every command accepts the card number for direct reference.
- `/ps:refine` claims the card (assigns the user, moves it to In Refinement),
  analyzes the code, runs Grill Me, and turns the draft into a refined,
  issue-ready document in one standard format (lean summary, technical detail,
  in/out of scope, subtask breakdown) written to `pscode/changes/<slug>/refine.md`.
  When `pscode/github.yaml` exists it reads the open Issue description + comments
  as input and, on approval, turns each `## Subtasks` item into a native
  **sub-issue** of the card (so the board shows the breakdown + a progress bar),
  updates the Issue body from `refine.md` (dropping the now-redundant checklist),
  and moves the card to **Ready to Dev**. `/ps:dev` closes each sub-issue as its
  subtask is ticked.
- `/ps:dev` opens a draft PR linked to the Issue (`Closes #`), moves the card to
  In Development and assigns the user, implements the `refine.md` subtasks one at
  a time, then — once the project builds and its tests pass — walks the card
  through In Code Review (PR marked Ready for Review) → In Test → Ready to
  Deploy. Merging the PR stays a human/CI decision.
- `/ps:complete` writes a short openspec-style delta spec, archives the change to
  `pscode/changes/archive/<YYYY-MM-DD>-<slug>/`, and moves the card to Done
  (closing the Issue). `/ps:cancel` archives with a reason and moves the card to
  Cancelled.
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
- **Environment verification concentrated in `init`** (`core/preflight.ts`):
  `init` and `doctor` run a non-blocking check — Git installed, inside a repo,
  GitHub remote, GitHub CLI installed and authenticated, Node version, the
  selected agent CLI — and scan the project's MCP config files (`.mcp.json`,
  `.cursor/mcp.json`, `.vscode/mcp.json`, `.claude/settings*.json`) for declared
  MCP servers. A failing check prints how to fix it and `init` carries on. (A CLI
  can only see whether an MCP is *declared*, not *connected* — that stays the
  agent's job.)
- **GitHub Projects + Issues setup** (`core/github.ts`, `commands/init-github.ts`):
  one wizard question — use an existing Project, create a new one, or skip. For
  an existing Project it lists the account's Projects to pick from (plus an
  "Other — paste a link" fallback); when creating, it prompts for the Project
  name (defaulting to the project folder name). It discovers the GraphQL ids via
  `gh` and writes `pscode/github.yaml` (repo,
  project node id, Status field id, stage→option-id map). Non-interactive via
  `--project <ref>`; skipped by default when non-interactive. Every `gh` call is
  non-blocking. New flags: `--github` / `--no-github`, `--project <url|owner/repo>`.
  A new `github.enabled` flag in `config.yaml` records it (and `update` preserves
  it).
- **Per-step board sync** (`pscode-github-sync` skill + sections in the command
  bodies): when `pscode/github.yaml` exists the agent keeps the Issue, board,
  assignee and PR in sync across the nine columns — `/ps:draft` creates the
  Issue, adds it to the Project, sets **Backlog** and stores the number in
  `pscode/changes/<slug>/.issue`; `/ps:refine` → **In Refinement** (assigns the
  user) then **Ready to Dev**; `/ps:dev` opens a draft PR and goes **In
  Development** → **In Code Review** → **In Test** → **Ready to Deploy**;
  `/ps:complete` → **Done** (closes the Issue); `/ps:cancel` → **Cancelled**. The
  change↔issue link resolves deterministically (`links` → `.issue` →
  `<issuePattern>-NN`, via `resolveIssueNumber`), and every command also accepts
  the card number directly. `github.yaml` now also stores the Project `owner` so
  `gh project …` calls work for org-owned Projects. "Non-blocking" means tolerate
  failure, **not** skip the work: the agent always *attempts* every action a step
  prescribes — the status move (two `gh` calls: `item-list` then `item-edit`) is
  the core action and is never skipped just because the cheaper `assign` already
  ran — and confirms the move landed; only a `gh`/auth/network failure makes it
  report and carry on.
- **Board setup** (`/ps:board-setup` + `pscode-board-setup` skill): a fresh
  GitHub Project is a plain Table with the default Status options. This command
  drives the GitHub UI through the **Chrome MCP** to create the kanban columns
  (Backlog, In Refinement, Ready to Dev, In Development, In Code Review, In Test,
  Ready to Deploy, Done, Cancelled) and switch the view to a Status-grouped
  Board, then re-discovers the option ids via `gh` and rewrites the `statuses`
  map in `pscode/github.yaml`. Whenever the board is set up (existing or new
  Project), `init` hands off straight into `/ps:board-setup` if it opens Claude
  Code, otherwise it prints a hint to run it. `github.yaml` now also stores the
  Project `ownerType` so the board URL can be built. The flow's nine stages map
  one-to-one onto the columns (`backlog`, `proposed`/In Refinement,
  `ready_to_dev`, `in_progress`/In Development, `review`/In Code Review,
  `in_test`, `ready_to_deploy`, `done`, `cancelled`), all written into the
  `statuses` map by `/ps:board-setup`.
- **Requirements manifest** (`pscode/requirements.yaml`): `init` writes what each
  active integration needs and what it verified (preflight results + declared
  MCPs), for the agent to consume instead of re-probing the environment.
- The "open the agent now?" prompt runs **last** — after every other question
  (language, agents, bypassPermissions, GitHub) and after the install summary.
- Removes the workflow engine, schemas, artifact graph, validation, workspaces,
  context store/initiatives, telemetry, completions, the local board and related
  commands.

BREAKING CHANGE: the previous commands, schemas and APIs have been removed.
