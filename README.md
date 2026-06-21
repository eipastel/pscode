# pscode

> Installs a guided SDD workflow into your coding agent.

[![npm](https://img.shields.io/npm/v/@thiagodiogo/pscode)](https://www.npmjs.com/package/@thiagodiogo/pscode)
[![license](https://img.shields.io/npm/l/@thiagodiogo/pscode)](LICENSE)

PSCode is a **lightweight installer**, not a workflow engine. It lays down slash
commands, skills, instructions and a minimal `pscode/` structure so your coding
agent (Claude Code, Codex, Cursor, Gemini) can follow a short,
**human-validated** spec-driven flow — you approve every step:

```
/ps:draft → /ps:refine <card#> → /ps:dev <card#> → /ps:complete <card#>
```

The flow mirrors the GitHub Project board, moving the card across its columns at
each step. `/ps:cancel <card#>` sends a card to Cancelled.

## Install

```bash
npm install -g @thiagodiogo/pscode
```

Requires Node.js `>= 20.19.0`.

## Usage

```bash
cd your-project
pscode init        # interactive wizard: pick agents, scaffold pscode/
```

`init` is interactive by default: it first asks the **wizard language** (English
or Português), then which agents to install. The language only affects the
wizard — installed commands and skills are always in English. Pass `--yes` for a
non-interactive run with defaults, or `--lang <code>` / `--agent <id>` to set
choices explicitly.

Then, inside your agent:

```
/ps:draft "add a type filter to the movie search"
```

The agent walks you through short, validated steps. Each change is a small,
versionable folder under `pscode/changes/<slug>/` (`brief.md`, `questions.md`,
`refine.md`, `delta-spec.md`), archived under `pscode/changes/archive/` when done.

## Environment checks

`init` (and `doctor`) run a quick, **non-blocking** preflight: Git, a GitHub
remote, the GitHub CLI (`gh`) and its auth, your Node version, the selected agent
CLI, and any MCP servers declared in the project. A failing check just prints how
to fix it — `init` always finishes. What it found is recorded in
`pscode/requirements.yaml` so the agent reads it instead of re-probing.

## GitHub Projects + Issues (optional)

`init` can wire the flow to a **GitHub Project (v2)**. Answer the board question —
use an existing Project, create a new one (you name it; defaults to the project
folder), or skip — and PSCode writes `pscode/github.yaml`. From then on the agent
keeps the Issue and board in sync as you go:

| Step                | Board column  |
| ------------------- | ------------- |
| `/ps:draft`         | Backlog (creates the Issue) |
| `/ps:refine <card#>`| In Refinement (claims the card) → Ready to Dev (updates the Issue body) |
| `/ps:dev <card#>`   | In Development (opens a draft PR) → In Code Review → In Test → Ready to Deploy |
| `/ps:complete <card#>` | Done (closes the Issue) |
| `/ps:cancel <card#>`| Cancelled (closes the Issue) |

Every `gh` call is non-blocking. Control it non-interactively with
`--github` / `--no-github` and `--project <url|owner/repo>`. Requires `gh`
installed and authenticated (`gh auth login`).

When `init` creates a **new** Project, run `/ps:board-setup` inside the agent to
turn it into a kanban board (status columns + a Status-grouped Board view). It
drives the GitHub UI through the Chrome MCP, then refreshes `pscode/github.yaml`.
If you let `init` open Claude Code, it hands off straight into that command.

## Commands

| CLI               | Does                                                      |
| ----------------- | -------------------------------------------------------- |
| `pscode init`     | Install the workflow (`--agent`, `--lang`, `--bypass-permissions`, `--open`, `--github`, `--project`, `--yes`) |
| `pscode update`   | Refresh installed commands/skills/instructions in place  |
| `pscode doctor`   | Check the project is correctly configured                |
| `pscode clean`    | Remove generated files (`--all` also removes `pscode/`)  |
| `pscode status`   | List changes and their state                             |

The `/ps:*` slash commands drive the flow shown above; settings and the
short-document limits live in `pscode/config.yaml`.

## License

MIT
