# pscode

> Installs a guided SDD workflow into your coding agent.

[![npm](https://img.shields.io/npm/v/@thiagodiogo/pscode)](https://www.npmjs.com/package/@thiagodiogo/pscode)
[![license](https://img.shields.io/npm/l/@thiagodiogo/pscode)](LICENSE)

PSCode is a **lightweight installer**, not a workflow engine. It lays down slash
commands, skills, instructions and a minimal `pscode/` structure so your coding
agent (Claude Code, Codex, Cursor, Gemini) can follow a short,
**human-validated** spec-driven flow — you approve every step:

```
/ps:do → /ps:grill → /ps:spec → /ps:design → /ps:tasks → /ps:apply-one → /ps:review → /ps:done
```

## Install

```bash
npm install -g @thiagodiogo/pscode
```

Requires Node.js `>= 20.19.0`.

## Usage

```bash
cd your-project
pscode init        # interactive wizard: pick agents + board, scaffold pscode/
```

`init` is interactive by default: it first asks the **wizard language** (English
or Português), then which agents to install and whether to create a local board.
The language only affects the wizard — installed commands and skills are always
in English. Pass `--yes` for a non-interactive run with defaults, or
`--lang <code>` / `--agent <id>` / `--no-board` to set choices explicitly.

Then, inside your agent:

```
/ps:do "add a type filter to the movie search"
```

The agent walks you through short, validated steps. Each change is a small,
versionable folder under `pscode/changes/<slug>/` (`brief.md`, `questions.md`,
`design.md`, `tasks.md`, `review.md`).

## Commands

| CLI               | Does                                                      |
| ----------------- | -------------------------------------------------------- |
| `pscode init`     | Install the workflow (`--agent`, `--no-board`, `--yes`)  |
| `pscode update`   | Refresh installed commands/skills/instructions in place  |
| `pscode doctor`   | Check the project is correctly configured                |
| `pscode clean`    | Remove generated files (`--all` also removes `pscode/`)  |
| `pscode status`   | List changes and their state                             |

The eight `/ps:*` slash commands drive the flow shown above; settings and the
short-document limits live in `pscode/config.yaml`.

## License

MIT
