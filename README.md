# pscode

> Installs a guided SDD workflow into your coding agent.

[![npm](https://img.shields.io/npm/v/@thiagodiogo/pscode)](https://www.npmjs.com/package/@thiagodiogo/pscode)
[![license](https://img.shields.io/npm/l/@thiagodiogo/pscode)](LICENSE)
[![node](https://img.shields.io/node/v/@thiagodiogo/pscode)](https://nodejs.org)

PSCode is a **lightweight installer**. It lays down slash commands, skills,
instructions and a minimal file structure so coding agents (Claude Code, Codex,
Cursor, Gemini, GitHub Copilot) can follow a short, guided, human-validated
spec-driven flow. It is **not** a workflow engine — the agent drives the flow,
PSCode just installs the rails.

The experience is **guided**, not autopilot:

```
request → understand → grill (quick questions) → mini spec → design →
tasks → one task at a time → review → done
```

You validate between every step. Each artifact fits on one terminal screen.

---

## Requirements

- Node.js `>= 20.19.0`
- A coding agent: **Claude Code**, **Codex**, **Cursor**, **Gemini CLI**, or **GitHub Copilot**

---

## Install

```bash
npm install -g @thiagodiogo/pscode
```

---

## Quick Start

```bash
cd your-project
pscode init
```

`init` detects your agents, installs the slash commands and skills, and creates
a minimal `pscode/` directory:

```
.
├── AGENTS.md                 # gets a small managed PSCode block
├── pscode/
│   ├── config.yaml           # agents, limits, guardrails
│   ├── board.yaml            # optional local board
│   ├── templates/            # short change templates
│   └── changes/              # your changes live here
└── .claude/                  # (per agent)
    ├── commands/ps/*.md       # /ps:do, /ps:grill, …
    └── skills/pscode-*/SKILL.md
```

Then, inside your agent:

```
/ps:do "add a type filter to the movie search"
```

The agent guides you through short, validated steps.

---

## Slash commands

| Command         | What it does                                            |
| --------------- | ------------------------------------------------------- |
| `/ps:do`        | Start a guided change from a natural-language request   |
| `/ps:grill`     | Ask objective questions to remove ambiguity (max 5)     |
| `/ps:spec`      | Write/revise a short `brief.md`                          |
| `/ps:design`    | Write `design.md` — likely files, decisions, risks      |
| `/ps:tasks`     | Write `tasks.md` — small, ordered tasks                 |
| `/ps:apply-one` | Implement only the next pending task                    |
| `/ps:review`    | Review the change against the brief; record validation  |
| `/ps:done`      | Finalize the change                                     |

---

## CLI commands

| Command          | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `pscode init`    | Install the guided workflow into the current project      |
| `pscode update`  | Refresh PSCode commands, skills and instructions in place |
| `pscode doctor`  | Verify the project is correctly configured                |
| `pscode clean`   | Remove PSCode-generated files (`--all` removes `pscode/`) |
| `pscode status`  | List changes and their basic state                        |

Useful flags: `pscode init --agent claude --agent codex`, `--no-board`, `--yes`.

---

## A change at a glance

Each change is a small, versionable folder:

```
pscode/changes/add-search-type/
├── brief.md       # objective, expected behavior, out of scope
├── questions.md   # Grill Me Q&A
├── design.md      # likely files, decisions, risks
├── tasks.md       # small tasks
└── review.md      # what changed, validation, pending items
```

---

## Philosophy

1. Simplicity over completeness.
2. Instructions and skills over a complex engine.
3. Short specs over giant documents.
4. Human validation between steps.
5. One task at a time.
6. A workflow anyone can understand.
7. Simple, versionable Markdown.
8. Compatible with multiple agents.
9. Local-first.
10. Low maintenance.

---

## License

MIT
